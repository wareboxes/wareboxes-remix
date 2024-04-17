import { and, desc, isNull, sql } from "drizzle-orm";
import { SessionUser, auth } from "./auth";
import { db } from "./db";
import {
  permissions,
  type SelectPermission as Permission,
  type SelectUser as User
} from "./types/db/users";
import { addRoleAndUserRole, addRolePermission, getRoles, getUserRoles } from "./roles";

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
  request: Request
) => {
  const user = await getRequestUser(request);
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const hasPermission = Array.isArray(permissionName)
    ? await userHasAnyPermission(user, permissionName)
    : await userHasPermission(user, permissionName);

  if (!hasPermission) {
    throw new Response("Forbidden", { status: 403 });
  }
};
