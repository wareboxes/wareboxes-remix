import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import {
  permissions,
  rolePermissions,
  roles,
  userRoles,
  type InsertRole,
  type SelectPermission as Permission,
  type SelectRole as Role,
} from "./types/db/users";
import { addDevAdmin } from "./permissions";
import { Result } from "./types/result";

export const addRolePermission = async (
  roleId: number,
  permissionId: number
): Promise<Result<boolean>> => {
  const res = await db
    .insert(rolePermissions)
    .values({
      roleId: roleId,
      permissionId: permissionId,
    })
    .onConflictDoUpdate({
      target: [rolePermissions.roleId, rolePermissions.permissionId],
      set: {
        deleted: null,
      },
    });
  return { success: !!res };
};

export const deleteRolePermission = async (
  roleId: number,
  permissionId: number
): Promise<Result<boolean>> => {
  const res = await db
    .update(rolePermissions)
    .set({ deleted: new Date().toISOString() })
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId)
      )
    );

  return { success: !!res };
};

export const addRole = async (
  role: string,
  description: string
): Promise<Result<number>> => {
  const res = await db
    .insert(roles)
    .values({ name: role, description })
    .returning({ id: roles.id });
  return { success: !!res, data: res[0].id };
};

export const addRoleRelationship = async (
  parentRoleId: number,
  childRoleId: number
): Promise<Result<boolean>> => {
  if (parentRoleId === childRoleId) {
    return {
      success: false,
      errors: ["Parent and child roles cannot be the same"],
    };
  }

  const parentRole = (await getRole(parentRoleId)).data;
  if (!parentRole) {
    return { success: false, errors: ["Parent role not found"] };
  }
  // Check if child role is already a parent or child of the parent role
  if (parentRole.childRoles?.some((r) => r.id === childRoleId)) {
    return {
      success: false,
      errors: ["Child role is already a child of the parent role"],
    };
  }
  if (parentRole.parentRoles?.some((r) => r.id === childRoleId)) {
    return {
      success: false,
      errors: ["Child role is a parent of the parent role"],
    };
  }

  const insertRes = await db
    .update(roles)
    .set({ parentId: parentRoleId })
    .where(eq(roles.id, childRoleId));

  return { success: !!insertRes };
};

export const deleteRoleRelationship = async (
  parentRoleId: number,
  childRoleId: number
): Promise<Result<boolean>> => {
  const parentRole = await getRole(parentRoleId);
  if (!parentRole) {
    return { success: false, errors: ["Parent role not found"] };
  }

  const deleteRes = await db
    .update(roles)
    .set({ parentId: null })
    .where(eq(roles.id, childRoleId));

  return { success: !!deleteRes };
};

export const addRoleToUser = async (
  userId: number,
  roleId: number
): Promise<Result<boolean>> => {
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
  return { success: !!res };
};

export const updateRole = async (
  roleId: number,
  roleData: Partial<InsertRole>
): Promise<Result<boolean>> => {
  // Get keys from the user object
  const keys = Object.keys(roleData).filter(
    (key) => key !== "id" && roleData[key as keyof typeof roleData] !== null
  );
  if (keys.length === 0)
    return { success: false, errors: ["No data to update"] };

  const res = await db
    .update(roles)
    .set(roleData)
    .where(eq(roles.id, roleId))
    .returning({ id: roles.id });

  return { success: !!res };
};

export const deleteRole = async (id: number): Promise<Result<boolean>> => {
  const res = await db
    .update(roles)
    .set({ deleted: new Date().toISOString() })
    .where(eq(roles.id, id))
    .returning({ id: roles.id });

  return { success: !!res };
};

export const restoreRole = async (id: number): Promise<Result<boolean>> => {
  const res = await db
    .update(roles)
    .set({ deleted: null })
    .where(eq(roles.id, id))
    .returning({ id: roles.id });

  return { success: !!res };
};

export const getRole = async (id: number): Promise<Result<Role>> => {
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
  return { success: !!res, data: res[0] };
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
        (
          WITH RECURSIVE RoleHierarchy AS (
            SELECT r.id, r.parent_id, r.name
            FROM wareboxes.roles r
            WHERE r.id = roles.id
            UNION ALL
            SELECT r.id, r.parent_id, r.name
            FROM wareboxes.roles r
            INNER JOIN RoleHierarchy rh ON rh.id = r.parent_id
          ),
          DistinctRolePermissions AS (
            SELECT DISTINCT ON (p.id)
              p.id,
              p.name,
              p.description,
              p.created,
              p.deleted,
              rh.name AS roleName,
              rh.id AS roleId
            FROM wareboxes.permissions p
            INNER JOIN wareboxes.role_permissions rp ON rp.permission_id = p.id
            INNER JOIN RoleHierarchy rh ON rh.id = rp.role_id
            WHERE p.deleted IS NULL
            AND rp.deleted IS NULL
            ORDER BY p.id, rp.created DESC
          )
          SELECT COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', p.id,
                  'name', UPPER(p.name),
                  'roleName', p.roleName,
                  'roleId', p.roleId,
                  'description', p.description,
                  'created', p.created,
                  'deleted', p.deleted
                )
              ) FROM DistinctRolePermissions p
            ),
            '[]'::json
          ) AS "rolePermissions"
        ) AS "rolePermissions"
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
  return { success: true, data: res };
};

export const getRolePermissions = async (
  roleId: number
): Promise<Result<Permission[]>> => {
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
  return { success: true, data: res };
};

export const getUserRoles = async (userId: number): Promise<Result<Role[]>> => {
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

  return { success: true, data: res };
};

export const addUserRole = async (
  userId: number,
  roleId: number
): Promise<Result<boolean>> => {
  const res = await db.insert(userRoles).values({
    userId: userId,
    roleId: roleId,
  });
  return { success: !!res };
};

export const addRoleAndUserRole = async (
  userId: number,
  email: string
): Promise<Result<boolean>> => {
  await db.transaction(async (tx) => {
    const res = await tx
      .insert(roles)
      .values({ name: email, description: "Self role" })
      .returning({ id: roles.id });
    await tx.insert(userRoles).values({ userId: userId, roleId: res[0].id });
  });
  await addDevAdmin(email);
  return { success: true };
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

export const AddDeleteRolePermissionSchema = z.object({
  roleId: z.number({ coerce: true }).positive("Invalid role ID"),
  permissionId: z.number({ coerce: true }).positive("Invalid permission ID"),
});
