import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { SessionUser, auth } from "./auth";
import { db } from "./db";
import {
  permissions,
  rolePermissions,
  roles,
  userRoles,
  type InsertRole,
  type SelectPermission as Permission,
  type SelectRole as Role,
  type SelectUser as User,
} from "./types/db/users";

export const addPermission = async (
  permission: string,
  description: string
): Promise<{ success: boolean; id: number }> => {
  const res = await db
    .insert(permissions)
    .values({ name: permission, description })
    .returning({ id: permissions.id });
  return { success: true, id: res[0].id };
};

export const addRolePermission = async (
  roleId: number,
  permissionId: number
): Promise<boolean> => {
  const res = await db.insert(rolePermissions).values({
    roleId: roleId,
    permissionId: permissionId,
  });
  return !!res;
};

export const addRole = async (
  role: string,
  description: string
): Promise<{ success: boolean; id: number }> => {
  const res = await db
    .insert(roles)
    .values({ name: role, description })
    .returning({ id: roles.id });
  return { success: true, id: res[0].id };
};

export const addRoleRelationship = async (
  parentRoleId: number,
  childRoleId: number
): Promise<boolean> => {
  if (parentRoleId === childRoleId) {
    return false;
  }

  const parentRole = await getRole(parentRoleId);
  if (!parentRole) {
    return false;
  }
  // Check if child role is already a parent or child of the parent role
  if(parentRole.childRoles?.some((r) => r.id === childRoleId)) {
    return false;
  }
  if(parentRole.parentRoles?.some((r) => r.id === childRoleId)) {
    return false;
  }

  const insertRes = await db
    .update(roles)
    .set({ parentId: parentRoleId })
    .where(eq(roles.id, childRoleId));

  return !!insertRes;
};

export const deleteRoleRelationship = async (
  parentRoleId: number,
  childRoleId: number
): Promise<boolean> => {
  const parentRole = await getRole(parentRoleId);
  if (!parentRole) {
    return false;
  }

  const deleteRes = await db
    .update(roles)
    .set({ parentId: null })
    .where(eq(roles.id, childRoleId));

  return !!deleteRes;
}

export const addRoleToUser = async (
  userId: number,
  roleId: number
): Promise<boolean> => {
  // Check if user already has role
  const res = await db
    .insert(userRoles)
    .values({
      userId: userId,
      roleId: roleId,
    })
    .onConflictDoUpdate({
      target: [userRoles.userId, userRoles.roleId],
      set: {
        deleted: null,
      },
    });
  return !!res;
};

export const addPermissionToRole = async (
  roleId: number,
  permissionId: number
): Promise<boolean> => {
  const res = await db.insert(rolePermissions).values({
    roleId: roleId,
    permissionId: permissionId,
  });
  return !!res;
};

export const updateRole = async (
  roleId: number,
  roleData: Partial<InsertRole>
): Promise<boolean> => {
  // Get keys from the user object
  const keys = Object.keys(roleData).filter(
    (key) => key !== "id" && roleData[key as keyof typeof roleData] !== null
  );
  if (keys.length === 0) return false;

  const res = await db
    .update(roles)
    .set(roleData)
    .where(eq(roles.id, roleId))
    .returning({ id: roles.id });

  return !!res;
};

export const deleteRole = async (id: number): Promise<boolean> => {
  const res = await db
    .update(roles)
    .set({ deleted: new Date().toISOString() })
    .where(eq(roles.id, id))
    .returning({ id: roles.id });

  return !!res;
};

export const restoreRole = async (id: number): Promise<boolean> => {
  const res = await db
    .update(roles)
    .set({ deleted: null })
    .where(eq(roles.id, id))
    .returning({ id: roles.id });

  return !!res;
};

export const getRole = async (id: number): Promise<Role | null> => {
  const res = await db
    .select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      created: roles.created,
      deleted: roles.deleted,
      parentId: roles.parentId,
      parentRoles: sql<Role[]>`
        (
          WITH RECURSIVE ParentRoleHierarchy AS (
            SELECT
              r.id,
              r.name,
              r.description,
              r.created,
              r.deleted,
              r.parent_id
            FROM wareboxes.roles r
            WHERE r.id IN (
              SELECT
                parent_id
                -- Alias the table to avoid ambiguity
              FROM wareboxes.roles r
              WHERE id = roles.id
              AND deleted IS NULL
            )
            UNION ALL
            SELECT
              r.id,
              r.name,
              r.description,
              r.created,
              r.deleted,
              r.parent_id
            FROM wareboxes.roles r
            INNER JOIN ParentRoleHierarchy rh ON r.id = rh.parent_id
          ),
          DistinctParentRoles AS (
            SELECT DISTINCT
              rh.id,
              rh.name,
              rh.description,
              rh.created,
              rh.deleted,
              rh.parent_id
            FROM ParentRoleHierarchy rh
            WHERE rh.deleted IS NULL
          )
          SELECT COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', r.id,
                  'name', r.name,
                  'description', r.description,
                  'created', r.created,
                  'deleted', r.deleted,
                  'parentId', r.parent_id
                )
              ) FROM DistinctParentRoles r
            ),
            '[]'::json
          ) AS "parentRoles"
        ) AS "parentRoles"
      `,
      childRoles: sql<Role[]>`
        (
          WITH RECURSIVE ChildRoleHierarchy AS (
            SELECT
              r.id,
              r.name,
              r.description,
              r.created,
              r.deleted,
              r.parent_id
            FROM wareboxes.roles r
            WHERE r.parent_id = roles.id
            UNION ALL
            SELECT
              r.id,
              r.name,
              r.description,
              r.created,
              r.deleted,
              r.parent_id
            FROM wareboxes.roles r
            JOIN ChildRoleHierarchy rh ON r.parent_id = rh.id
          ),
          DistinctChildRoles AS (
            SELECT DISTINCT
              rh.id,
              rh.name,
              rh.description,
              rh.created,
              rh.deleted,
              rh.parent_id
            FROM ChildRoleHierarchy rh
            WHERE rh.deleted IS NULL
          )
          SELECT COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', r.id,
                  'name', r.name,
                  'description', r.description,
                  'created', r.created,
                  'deleted', r.deleted,
                  'parentId', r.parent_id
                )
              ) FROM DistinctChildRoles r
            ),
            '[]'::json
          ) AS "childRoles"
        ) AS "childRoles"
      `,
    })
    .from(roles)
    .where(eq(roles.id, id));
  return res[0];
};

export const getRoles = async (
  showDeleted?: boolean,
  showSelfRole?: boolean
) => {
  const res = await db
    .select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      created: roles.created,
      deleted: roles.deleted,
      parentRoles: sql<Role[]>`
        (
          WITH RECURSIVE ParentRoleHierarchy AS (
            SELECT
              r.id,
              r.name,
              r.description,
              r.created,
              r.deleted,
              r.parent_id
            FROM wareboxes.roles r
            WHERE r.id IN (
              SELECT
                parent_id
                -- Alias the table to avoid ambiguity
              FROM wareboxes.roles r
              WHERE id = roles.id
              AND deleted IS NULL
            )
            UNION ALL
            SELECT
              r.id,
              r.name,
              r.description,
              r.created,
              r.deleted,
              r.parent_id
            FROM wareboxes.roles r
            INNER JOIN ParentRoleHierarchy rh ON r.id = rh.parent_id
          ),
          DistinctParentRoles AS (
            SELECT DISTINCT
              rh.id,
              rh.name,
              rh.description,
              rh.created,
              rh.deleted,
              rh.parent_id
            FROM ParentRoleHierarchy rh
            WHERE rh.deleted IS NULL
          )
          SELECT COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', r.id,
                  'name', r.name,
                  'description', r.description,
                  'created', r.created,
                  'deleted', r.deleted,
                  'parentId', r.parent_id
                )
              ) FROM DistinctParentRoles r
            ),
            '[]'::json
          ) AS "parentRoles"
        ) AS "parentRoles"
      `,
      childRoles: sql<Role[]>`
        (
          WITH RECURSIVE ChildRoleHierarchy AS (
            SELECT
              r.id,
              r.name,
              r.description,
              r.created,
              r.deleted,
              r.parent_id
            FROM wareboxes.roles r
            WHERE r.parent_id = roles.id
            UNION ALL
            SELECT
              r.id,
              r.name,
              r.description,
              r.created,
              r.deleted,
              r.parent_id
            FROM wareboxes.roles r
            JOIN ChildRoleHierarchy rh ON r.parent_id = rh.id
          ),
          DistinctChildRoles AS (
            SELECT DISTINCT
              rh.id,
              rh.name,
              rh.description,
              rh.created,
              rh.deleted,
              rh.parent_id
            FROM ChildRoleHierarchy rh
            WHERE rh.deleted IS NULL
          )
          SELECT COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', r.id,
                  'name', r.name,
                  'description', r.description,
                  'created', r.created,
                  'deleted', r.deleted,
                  'parentId', r.parent_id
                )
              ) FROM DistinctChildRoles r
            ),
            '[]'::json
          ) AS "childRoles"
        ) AS "childRoles"
      `,
      rolePermissions: sql<Permission[]>`
        COALESCE(
          (
            SELECT json_agg(role_permissions."rolePermission")
            FROM (
              SELECT json_build_object(
                'id', p.id,
                'name', UPPER(p.name),
                'description', p.description,
                'created', p.created,
                'deleted', p.deleted
              ) AS "rolePermission"
              FROM wareboxes.permissions p
              INNER JOIN wareboxes.role_permissions rp ON rp.permission_id = p.id
              WHERE rp.role_id = roles.id
            ) AS "role_permissions"
          ),
          '[]'
        )
      `,
    })
    .from(roles)
    .where((roles) => {
      const conditions = [];

      if (!showDeleted) {
        conditions.push(isNull(roles.deleted));
      }
      if (!showSelfRole) {
        conditions.push(ne(roles.description, "Self role"));
      }

      return and(...conditions);
    })
    .orderBy(desc(roles.created))
    .groupBy(roles.id);
  return res;
};
export const getPermissions = async (
  showDeleted = false
): Promise<Permission[]> => {
  const res = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      description: permissions.description,
      created: permissions.created,
      deleted: permissions.deleted,
    })
    .from(permissions)
    .where((permissions) => {
      const conditions = [];

      if (!showDeleted) {
        conditions.push(isNull(permissions.deleted));
      }

      return and(...conditions);
    })
    .orderBy(desc(permissions.created));
  return res;
};

export const getRolePermissions = async (
  roleId: number
): Promise<Permission[]> => {
  const res: Permission[] = await db
    .select({
      id: permissions.id,
      name: permissions.name,
      description: permissions.description,
      created: permissions.created,
      deleted: permissions.deleted,
    })
    .from(roles)
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .groupBy(permissions.id)
    .where(eq(roles.id, roleId));
  return res;
};

export const getUserPermissions = async (
  userId: number
): Promise<Permission[]> => {
  const res: Permission[] = await db.execute(sql<Permission[]>`
    WITH RECURSIVE RoleHierarchy AS (
      SELECT r.id, r.parent_id
      FROM wareboxes.user_roles ur
      INNER JOIN wareboxes.roles r ON r.id = ur.role_id
      WHERE ur.user_id = ${userId}
      AND ur.deleted IS NULL
      AND r.deleted IS NULL
      UNION
      SELECT r.id, r.parent_id
      FROM wareboxes.roles r
      INNER JOIN RoleHierarchy rh ON rh.id = r.parent_id
      WHERE r.deleted IS NULL
    )
    SELECT DISTINCT p.id, UPPER(p.name) as name, p.description, p.created, p.deleted
    FROM wareboxes.permissions p
    INNER JOIN wareboxes.role_permissions rp ON rp.permission_id = p.id
    INNER JOIN RoleHierarchy rh ON rh.id = rp.role_id
    WHERE p.deleted IS NULL
    AND rp.deleted IS NULL;
  `);
  return res;
};

export const getUserRoles = async (userId: number): Promise<Role[]> => {
  const res: Role[] = await db.execute(sql<Role[]>`
    WITH RECURSIVE RoleHierarchy AS (
      SELECT r.id, r.name, r.description, r.created, r.deleted, r.parent_id
      FROM wareboxes.user_roles ur
      INNER JOIN wareboxes.roles r ON r.id = ur.role_id
      WHERE ur.user_id = ${userId}
      AND r.deleted IS NULL
      AND ur.deleted IS NULL
      UNION
      SELECT r.id, r.name, r.description, r.created, r.deleted, r.parent_id
      FROM wareboxes.roles r
      INNER JOIN RoleHierarchy rh ON rh.id = r.parent_id
      WHERE r.deleted IS NULL
    )
    SELECT DISTINCT id, name, description, created, deleted
    FROM RoleHierarchy;
  `);

  return res;
};

export const addUserRole = async (
  userId: number,
  roleId: number
): Promise<boolean> => {
  const res = await db.insert(userRoles).values({
    userId: userId,
    roleId: roleId,
  });
  return !!res;
};

export const addRoleAndUserRole = async (
  userId: number,
  email: string
): Promise<boolean> => {
  let success = false;
  await db.transaction(async (tx) => {
    const res = await tx
      .insert(roles)
      .values({ name: email, description: "Self role" })
      .returning({ id: roles.id });
    await tx.insert(userRoles).values({ userId: userId, roleId: res[0].id });
    // If we are in dev environment, add the admin role to the user
    await addDevAdmin(email);
    success = true;
  });
  return success;
};

export const userHasPermission = async (
  user: User | Partial<SessionUser>,
  permissionName: string
): Promise<boolean> => {
  try {
    if (!user.id || !user.email) {
      return false;
    }
    const userRoles = await getUserRoles(user.id);
    if (!userRoles.some((r) => r.name === user?.email)) {
      await addRoleAndUserRole(user.id, user.email);
    }
    const userPermissions = await getUserPermissions(user.id);
    return userPermissions.some(
      (p) => p.name.toUpperCase() === permissionName.toUpperCase()
    );
  } catch (error) {
    return false;
  }
};

export const userHasAnyPermission = async (
  user: User | Partial<SessionUser>,
  permissionNames: string[]
): Promise<boolean> => {
  if (!user.id) {
    return false;
  }
  const userPermissions = await getUserPermissions(user.id);
  return permissionNames.some((permission) =>
    userPermissions.some(
      (userPermission) =>
        userPermission.name.toUpperCase() === permission.toUpperCase()
    )
  );
};

export const getPermissionStatus = async (
  user: User | null,
  permissionNames: string[]
): Promise<{ [key: string]: boolean }> => {
  if (!user) {
    return permissionNames.reduce((permissionsMap, permission) => {
      permissionsMap[permission] = false;
      return permissionsMap;
    }, {} as { [key: string]: boolean });
  }

  const userPermissions = await getUserPermissions(user.id);

  return permissionNames.reduce((permissionsMap, permission) => {
    permissionsMap[permission] = userPermissions.some(
      (p) => p.name.toUpperCase() === permission.toUpperCase()
    );
    return permissionsMap;
  }, {} as { [key: string]: boolean });
};

export async function addDevAdmin(email: string) {
  if (process.env.NODE_ENV === "development") {
    // Check if the permission exists
    const permissionRes = await getPermissions();
    let permissionId = permissionRes.find(
      (p) => p.name.toUpperCase() === "admin".toUpperCase()
    )?.id;
    if (!permissionId) {
      permissionId = (await addPermission("admin", "Admin permission"))?.id;
    }
    // Get self role
    const roleRes = await getRoles(false, true);

    const role = roleRes.find((r) => r.name === email);
    // If users doesn't have permission, add it
    if (role && !role.rolePermissions?.some((p) => p.id === permissionId)) {
      await addRolePermission(role.id, permissionId);
    }
  }
}

const getRequestUser = async (request: Request) => {
  const user = await auth.isAuthenticated(request);
  return user;
};

export const withAuth = async (
  permissionName: string | string[],
  request: Request,
) => {
  const user = await getRequestUser(request);
  if (!user) {
    throw new Response("Unauthorized", { status: 401 })
  }

  const hasPermission = Array.isArray(permissionName)
    ? await userHasAnyPermission(user, permissionName)
    : await userHasPermission(user, permissionName);

  if (!hasPermission) {
    throw new Response("Unauthorized", { status: 401 });
  }

};

export const UpdateRoleSchema = z.object({
  roleId: z.number({ coerce: true }).positive("Invalid role ID"),
  name: z.string().optional(),
  description: z.string().optional(),
});

export const DeleteRestoreRoleSchema = z.object({
  roleId: z.number({ coerce: true }).positive("Invalid role ID"),
});

export const AddDeleteUserRoleSchema = z.object({
  userId: z.number({ coerce: true }).positive("Invalid user ID"),
  roleId: z.number({ coerce: true }).positive("Invalid role ID"),
});

export const AddDeleteChildRoleSchema = z.object({
  roleId: z.number({ coerce: true }).positive("Invalid role ID"),
  childRoleId: z.number({ coerce: true }).positive("Invalid role ID"),
});