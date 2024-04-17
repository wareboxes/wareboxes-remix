import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  getPermissions,
  withAuth
} from "~/utils/permissions";
import { actionResponse } from "~/utils/types/actions";
import { RoleActions } from "./Actions";
import { AddDeleteChildRoleSchema, AddDeleteRolePermissionSchema, DeleteRestoreRoleSchema, UpdateRoleSchema, addRolePermission, addRoleRelationship, deleteRole, deleteRolePermission, deleteRoleRelationship, getRoles, restoreRole, updateRole } from "~/utils/roles";

export async function loader({ request }: LoaderFunctionArgs) {
  await withAuth("admin", request);
  return {
    roles: await getRoles(true, true),
    permissions: await getPermissions(),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case RoleActions.UpdateRole:
      return handleUpdateRole(formData);
    case RoleActions.DeleteRole:
      return handleDeleteRole(formData);
    case RoleActions.RestoreRole:
      return handleRestoreRole(formData);
    case RoleActions.AddChildRole:
      return handleAddChildRole(formData);
    case RoleActions.DeleteChildRole:
      return handleDeleteChildRole(formData);
    case RoleActions.AddRolePermission:
      return handleAddRolePermission(formData);
    case RoleActions.DeleteRolePermission:
      return handleDeleteRolePermission(formData);
    default:
      return json(actionResponse(false, "Invalid action"));
  }
}

async function handleUpdateRole(formData: FormData) {
  const result = UpdateRoleSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid role data", result.error.flatten())
    );
  }

  const { roleId, ...roleData } = result.data;
  const res = await updateRole(roleId, roleData);
  return json(actionResponse(res));
}

async function handleDeleteRole(formData: FormData) {
  const result = DeleteRestoreRoleSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid role id", result.error.flatten())
    );
  }

  const { roleId } = result.data;
  const res = await deleteRole(Number(roleId));
  return json(actionResponse(res));
}

async function handleRestoreRole(formData: FormData) {
  const result = DeleteRestoreRoleSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid role id", result.error.flatten())
    );
  }

  const { roleId } = result.data;
  const res = await restoreRole(Number(roleId));
  return json(actionResponse(res));
}

async function handleAddChildRole(formData: FormData) {
  const result = AddDeleteChildRoleSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return json(actionResponse(false, "Error", result.error.flatten()));
  }

  const { roleId, childRoleId } = result.data;
  const res = await addRoleRelationship(Number(roleId), Number(childRoleId));
  return json(actionResponse(res));
}

async function handleDeleteChildRole(formData: FormData) {
  const result = AddDeleteChildRoleSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return json(actionResponse(false, "Error", result.error.flatten()));
  }

  const { roleId, childRoleId } = result.data;
  const res = await deleteRoleRelationship(Number(roleId), Number(childRoleId));
  return json(actionResponse(res));
}

async function handleAddRolePermission(formData: FormData) {
  const result = AddDeleteRolePermissionSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return json(actionResponse(false, "Error", result.error.flatten()));
  }

  const { roleId, permissionId } = result.data;
  const res = await addRolePermission(Number(roleId), Number(permissionId));
  return json(actionResponse(res));
}

async function handleDeleteRolePermission(formData: FormData) {
  const result = AddDeleteRolePermissionSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return json(actionResponse(false, "Error", result.error.flatten()));
  }

  const { roleId, permissionId } = result.data;
  const res = await deleteRolePermission(Number(roleId), Number(permissionId));
  return json(actionResponse(res));
}
