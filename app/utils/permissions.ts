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
  const res = await db.select().from(roles).where(eq(roles.id, parentRoleId));
  if (!res[0]) {
    return false;
  }

  const res2 = await db.execute(sql`
    WITH RECURSIVE RoleHierarchy AS (
      SELECT id, parent_id
      FROM wareboxes.roles
      WHERE id = ${childRoleId}
      UNION ALL
      SELECT r.id, r.parent_id
      FROM wareboxes.roles r
      JOIN RoleHierarchy rh ON r.parent_id = rh.id
    )
    SELECT COUNT(*) > 0 AS cycleDetected
    FROM RoleHierarchy
    WHERE id = ${parentRoleId} OR id = ${childRoleId};
  `);

  const cycleDetected = res2[0]?.cycleDetected;

  if (cycleDetected) {
    return false;
  }

  const insertRes = await db
    .update(roles)
    .set({ parentId: parentRoleId })
    .where(eq(roles.id, childRoleId));

  return !!insertRes;
};

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

export const getRole = async (id: number): Promise<InsertRole | null> => {
  const res = await db.select().from(roles).where(eq(roles.id, id));
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
      childRoles: sql<Role[]>`
        COALESCE(
          (
            SELECT json_agg(child_roles."childRole")
            FROM (
              SELECT json_build_object(
                'id', r.id,
                'name', r.name,
                'description', r.description,
                'created', r.created,
                'deleted', r.deleted,
                'parentId', r.parent_id
              ) AS "childRole"
              FROM wareboxes.roles r
              WHERE r.parent_id = roles.id
            ) AS "child_roles"
          ),
          '[]'
        )
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
      `
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
    .orderBy(desc(roles.created));

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

export const getUserPermissionsBack = async (
  userId: number
): Promise<Permission[]> => {
  const res: Permission[] = await db.execute(sql<Permission[]>`
    WITH RECURSIVE RoleHierarchy AS (
      -- Start with the direct roles of the user
      SELECT r.id, r.parent_id
      FROM wareboxes.user_roles ur
      INNER JOIN wareboxes.roles r ON r.id = ur.role_id
      WHERE ur.user_id = ${userId} AND r.deleted IS NULL
      UNION
      -- Recursively find parent roles
      SELECT r.id, r.parent_id
      FROM wareboxes.roles r
      INNER JOIN RoleHierarchy rh ON rh.id = r.parent_id
    )
    SELECT DISTINCT p.id, UPPER(p.name) as name, p.description, p.created, p.deleted
    FROM wareboxes.permissions p
    INNER JOIN wareboxes.role_permissions rp ON rp.permission_id = p.id
    INNER JOIN RoleHierarchy rh ON rh.id = rp.role_id
    WHERE p.deleted IS NULL;
  `);

  return res;
};

export const getUserRoles = async (userId: number): Promise<Role[]> => {
  const res: Role[] = await db.execute(sql<Role[]>`
    WITH RECURSIVE RoleHierarchy AS (
      SELECT r.id, r.name, r.description, r.created, r.deleted, r.parent_id
      FROM wareboxes.user_roles ur
      INNER JOIN wareboxes.roles r ON r.id = ur.role_id
      WHERE ur.user_id = ${userId} AND r.deleted IS NULL
      UNION
      SELECT r.id, r.name, r.description, r.created, r.deleted, r.parent_id
      FROM wareboxes.roles r
      INNER JOIN RoleHierarchy rh ON rh.id = r.parent_id
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
  user: User | null,
  permissionName: string
): Promise<boolean> => {
  try {
    if (!user) return false;
    const userRoles = await getUserRoles(user.id);
    if (!userRoles.some((r) => r.name === user?.email)) {
      await addRoleAndUserRole(user.id, user.email);
    }
    const userPermissions = await getUserPermissionsBack(user.id);
    return userPermissions.some(
      (p) => p.name.toUpperCase() === permissionName.toUpperCase()
    );
  } catch (error) {
    return false;
  }
};

export const userHasAnyPermission = async (
  user: User | null,
  permissionNames: string[]
): Promise<boolean> => {
  if (!user) return false;
  const userPermissions = await getUserPermissionsBack(user.id);
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

  const userPermissions = await getUserPermissionsBack(user.id);

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

export const UpdateRoleSchema = z.object({
  roleId: z.number({ coerce: true }),
  name: z.string().optional(),
  description: z.string().optional(),
});

// export const withAuth = (
//   permissionName: string | string[],
//   handler: RequestHandler
// ): RequestHandler => {
//   return async (event: RequestEvent) => {
//     // Unless we define our own RequestEvent containing a user property, we need to cast event.locals to any
//     const user = (event.locals as unknown as { user: any }).user;
//     const hasPermission = Array.isArray(permissionName)
//       ? await userHasAnyPermission(user, permissionName)
//       : await userHasPermission(user, permissionName);
//     if (!hasPermission) {
//       return new Response(
//         JSON.stringify({ success: false, error: "Unauthorized" }),
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }
//     return handler(event);
//   };
// };

// export const withAuthLoad = (
//   permissionName: string | string[],
//   loadFunction: PageServerLoad | LayoutServerLoad
// ): PageServerLoad | LayoutServerLoad => {
//   return async (event: any) => {
//     const user = (event.locals as unknown as { user: any }).user;
//     const hasPermission = Array.isArray(permissionName)
//       ? await userHasAnyPermission(user, permissionName)
//       : await userHasPermission(user, permissionName);
//     if (!hasPermission) {
//       return { success: false, error: "Unauthorized" };
//     }
//     return loadFunction(event);
//   };
// };

// export const withAuthAction = (
//   permissionName: string,
//   action: Action
// ): Action => {
//   return async (request) => {
//     const user = (request.locals as unknown as { user: any }).user;
//     const hasPermission = Array.isArray(permissionName)
//       ? await userHasAnyPermission(user, permissionName)
//       : await userHasPermission(user, permissionName);
//     if (!hasPermission) {
//       return { success: false, error: "Unauthorized" };
//     }
//     return action(request);
//   };
// };
