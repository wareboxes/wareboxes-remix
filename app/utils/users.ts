import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { addDevAdmin } from "./permissions";
import { addRoleAndUserRole } from "./roles";
import {
  roles,
  userRoles,
  users,
  type InsertUser,
  type SelectPermission as Permissions,
  type SelectRole as Role,
  type SelectUser as User,
} from "./types/db/users";
import { Result } from "./types/result";

export const addUser = async (email?: string): Promise<Result<User>> => {
  if (!email) {
    return { success: false, errors: ["Email is required to create a user"] };
  }
  const getUserRes = await getUser("email", email);
  if (getUserRes.success) {
    return { success: true, data: getUserRes.data };
  }
  const res = await db
    .insert(users)
    .values({ email })
    .onConflictDoNothing()
    .returning();

  if (!res) return { success: false, errors: ["Failed to create user"] };
  console.log("res", res);
  const roleRes = addRoleAndUserRole(res[0].id, res[0].email);
  if (!roleRes) {
    return { success: false, errors: ["Failed to add user role"] };
  }
  return { success: true, data: res[0] };
};

export const updateUser = async (
  userId: number,
  userData: Partial<InsertUser>
): Promise<Result<User>> => {
  try {
    const res = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, userId))
      .returning();
    return { success: true, data: res[0] };
  } catch (error) {
    return { success: false, errors: [(error as Error).message] };
  }
};

export const deleteUser = async (id: number): Promise<Result<boolean>> => {
  const res = await db
    .update(users)
    .set({ deleted: new Date().toISOString() })
    .where(eq(users.id, id))
    .returning({ id: users.id });
  return { success: !!res };
};

type DeleteUserRoleParams =
  | { userId: number; roleId: number; userRoleId?: never }
  | { userId?: never; roleId?: never; userRoleId: number };

export const deleteUserRole = async (
  params: DeleteUserRoleParams
): Promise<Result<boolean>> => {
  const { userId, roleId, userRoleId } = params;

  if ((!userId || !roleId) && !userRoleId) {
    return {
      success: false,
      errors: ["Either userId and roleId or userRoleId is required"],
    };
  }

  if (userRoleId) {
    const res = await db
      .select({ description: roles.description })
      .from(roles)
      .innerJoin(userRoles, eq(userRoles.id, userRoleId));
    if (res[0].description === "Self role") {
      return { success: false, errors: ["Cannot delete self role"] };
    }
  } else {
    const res = await db
      .select({ description: roles.description })
      .from(roles)
      .innerJoin(userRoles, eq(userRoles.roleId, roles.id))
      .where(
        and(
          eq(userRoles.userId, Number(userId)),
          eq(userRoles.roleId, Number(roleId))
        )
      );
    if (res[0].description === "Self role") {
      return { success: false, errors: ["Cannot delete self role"] };
    }
  }

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
  return { success: !!res };
};

export const restoreUser = async (id: number): Promise<Result<boolean>> => {
  const res = await db
    .update(users)
    .set({ deleted: null })
    .where(eq(users.id, id))
    .returning({ id: users.id });
  return { success: !!res };
};

export const getUser = async (
  key: "email" | "id",
  value: string | number,
  deleted = false
): Promise<Result<User>> => {
  if (key !== "email" && key !== "id") {
    return {
      success: false,
      errors: ["Invalid key provided, key should be either 'email' or 'id'"],
    };
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
          ),
          '[]'
        )
      `,
      userPermissions: sql<Permissions[]>`
        (
          WITH RECURSIVE RoleHierarchy AS (
            SELECT r.id, r.parent_id
            FROM wareboxes.user_roles ur
            INNER JOIN wareboxes.roles r ON r.id = ur.role_id
            WHERE ur.user_id = ${users.id}
            AND ur.deleted IS NULL
            AND r.deleted IS NULL
            UNION ALL
            SELECT r.id, r.parent_id
            FROM wareboxes.roles r
            INNER JOIN RoleHierarchy rh ON rh.id = r.parent_id
            WHERE r.deleted IS NULL
          ),
          DistinctPermissions AS (
            SELECT DISTINCT p.id, p.name, p.description, p.created, p.deleted
            FROM wareboxes.permissions p
            INNER JOIN wareboxes.role_permissions rp ON rp.permission_id = p.id
            INNER JOIN RoleHierarchy rh ON rh.id = rp.role_id
            WHERE p.deleted IS NULL
            AND rp.deleted IS NULL
          )
          SELECT COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', dp.id,
                  'name', UPPER(dp.name),
                  'description', dp.description,
                  'created', dp.created,
                  'deleted', dp.deleted
                )
              )
              FROM DistinctPermissions dp
            ),
            '[]'::json
          ) AS userPermissions
        ) AS userPermissions
      `,
    })
    .from(users)
    .leftJoin(userRoles, eq(userRoles.userId, users.id))
    .leftJoin(roles, eq(roles.id, userRoles.roleId))
    .where(() => {
      const conditions = [eq(users[key], value)];
      conditions.push(isNull(userRoles.deleted));
      if (!deleted) {
        conditions.push(isNull(users.deleted));
      }
      return and(...conditions);
    })
    .groupBy(users.id);
  if (res[0]?.email) {
    await addDevAdmin(res[0].email);
  }
  return { success: !!res[0], data: res[0] };
};

export const getUsers = async (
  showDeleted = false
): Promise<Result<User[]>> => {
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
        (
          WITH RECURSIVE RoleHierarchy AS (
            SELECT r.id, r.parent_id
            FROM wareboxes.user_roles ur
            INNER JOIN wareboxes.roles r ON r.id = ur.role_id
            WHERE ur.user_id = ${users.id}
            UNION ALL
            SELECT r.id, r.parent_id
            FROM wareboxes.roles r
            INNER JOIN RoleHierarchy rh ON rh.id = r.parent_id
          ),
          DistinctPermissions AS (
            SELECT DISTINCT p.id, p.name, p.description, p.created, p.deleted
            FROM wareboxes.permissions p
            INNER JOIN wareboxes.role_permissions rp ON rp.permission_id = p.id
            INNER JOIN RoleHierarchy rh ON rh.id = rp.role_id
            WHERE p.deleted IS NULL
            AND rp.deleted IS NULL
          )
          SELECT COALESCE(
            (
              SELECT json_agg(json_build_object(
                'id', dp.id,
                'name', UPPER(dp.name),
                'description', dp.description,
                'created', dp.created,
                'deleted', dp.deleted
              ))
              FROM DistinctPermissions dp
            ),
            '[]'::json
          ) AS userPermissions
        ) AS userPermissions
      `,
    })
    .from(users)
    .leftJoin(
      userRoles,
      and(eq(userRoles.userId, users.id), isNull(userRoles.deleted))
    )
    .leftJoin(roles, and(eq(roles.id, userRoles.roleId), isNull(roles.deleted)))
    .where(() => {
      const conditions = [];
      if (!showDeleted) {
        conditions.push(isNull(users.deleted));
      }
      return and(...conditions);
    })
    .groupBy(users.id);
  return { success: true, data: res };
};

export const UserUpdateSchema = z.object({
  userId: z.number({ coerce: true }).positive("Invalid user ID"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  nickName: z.string().optional(),
  phone: z.string().optional(),
});

export const DeleteRestoreUserSchema = z.object({
  userId: z.number({ coerce: true }).positive("Invalid user ID"),
});
