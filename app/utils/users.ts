import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { addDevAdmin, addRoleAndUserRole } from "./permissions";
import {
  permissions,
  rolePermissions,
  roles,
  userRoles,
  users,
  type InsertUser,
  type SelectPermission as Permissions,
  type SelectRole as Role,
  type SelectUser as User,
} from "./types/db/users";

export const addUser = async (email?: string): Promise<User | null> => {
  if (!email) {
    throw new Error("Email is required to create a user");
  }
  const user = await getUser("email", email);
  if (user) {
    return user;
  }
  const res = await db
    .insert(users)
    .values({ email })
    .onConflictDoNothing()
    .returning();

  if (!res) return null;
  const roleRes = addRoleAndUserRole(res[0].id, res[0].email);
  if (!roleRes) {
    return null;
  }
  return res[0];
};

export const updateUser = async (
  userId: number,
  userData: Partial<InsertUser>
): Promise<boolean> => {
  const res = await db
    .update(users)
    .set(userData)
    .where(eq(users.id, userId))
    .returning({ id: users.id });
  return !!res;
};

export const deleteUser = async (id: number): Promise<boolean> => {
  const res = await db
    .update(users)
    .set({ deleted: new Date().toISOString() })
    .where(eq(users.id, id))
    .returning({ id: users.id });
  return !!res;
};

type DeleteUserRoleParams =
  | { userId: number; roleId: number; userRoleId?: never }
  | { userId?: never; roleId?: never; userRoleId: number };

export const deleteUserRole = async (
  params: DeleteUserRoleParams
): Promise<boolean> => {
  const { userId, roleId, userRoleId } = params;

  const query = db
    .update(userRoles)
    .set({ deleted: new Date().toISOString() })
    .$dynamic();
  if (userRoleId) {
    query.where(eq(userRoles.id, userRoleId));
  } else {
    query.where(
      and(
        eq(userRoles.userId, Number(userId)),
        eq(userRoles.roleId, Number(roleId))
      )
    );
  }

  const res = await query.returning({ id: userRoles.id });
  return !!res;
};

export const restoreUser = async (id: number): Promise<boolean> => {
  const res = await db
    .update(users)
    .set({ deleted: null })
    .where(eq(users.id, id))
    .returning({ id: users.id });
  return !!res;
};

export const getUser = async (
  key: "email" | "id",
  value: string | number,
  deleted = false
): Promise<User | null> => {
  if (key !== "email" && key !== "id") {
    throw new Error(
      'Invalid key provided, key should be either "email" or "id"'
    );
  }

  const res = await db
    .select({
      id: users.id,
      created: users.created,
      deleted: users.deleted,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      nickName: users.nickName,
      phone: users.phone,
      roles: sql`json_agg(json_build_object('id', ${roles.id}, 'name', ${roles.name}, 'description', ${roles.description}))`,
    })
    .from(users)
    .leftJoin(userRoles, eq(userRoles.userId, users.id))
    .leftJoin(roles, eq(roles.id, userRoles.roleId))
    .where(() => {
      const conditions = [eq(users[key], value)];
      if (!deleted) {
        conditions.push(isNull(users.deleted));
      }
      return and(...conditions);
    })
    .groupBy(users.id);

  await addDevAdmin(res[0].email);

  return res[0];
};

export const getUsers = async (showDeleted = false): Promise<User[]> => {
  const res = db
    .select({
      id: users.id,
      created: users.created,
      deleted: users.deleted,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      nickName: users.nickName,
      phone: users.phone,
      userRoles: sql<Role[]>`
        COALESCE(
          json_agg(
            json_build_object(
              'id', ${roles.id},
              'name', ${roles.name},
              'description', ${roles.description},
              'created', ${roles.created},
              'deleted', ${roles.deleted},
              'parentId', ${roles.parentId}
            )
          ) FILTER (WHERE ${roles.id} IS NOT NULL),
          '[]'
        )
      `,
      userPermissions: sql<Permissions[]>`
        COALESCE(
          json_agg(
            json_build_object(
              'id', ${permissions.id},
              'name', ${permissions.name},
              'description', ${permissions.description},
              'created', ${permissions.created},
              'deleted', ${permissions.deleted}
            )
          ) FILTER (WHERE ${permissions.id} IS NOT NULL),
          '[]'
        )
      `,
    })
    .from(users)
    .leftJoin(
      userRoles,
      and(eq(userRoles.userId, users.id), isNull(userRoles.deleted))
    )
    .leftJoin(roles, and(eq(roles.id, userRoles.roleId), isNull(roles.deleted)))
    .leftJoin(
      rolePermissions,
      and(eq(rolePermissions.roleId, roles.id), isNull(rolePermissions.deleted))
    )
    .leftJoin(
      permissions,
      and(
        eq(permissions.id, rolePermissions.permissionId),
        isNull(permissions.deleted)
      )
    )
    .$dynamic();

  if (!showDeleted) {
    res.where(isNull(sql`users.deleted`));
  }
  res.groupBy(users.id);
  return await res;
};

export const UserUpdateSchema = z.object({
  userId: z.number({ coerce: true }).positive('Invalid user ID'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  nickName: z.string().optional(),
  phone: z.string().optional(),
});

export const DeleteRestoreUserSchema = z.object({
  userId: z.number({ coerce: true }).positive('Invalid user ID'),
});