import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  AddPermissionSchema,
  DeleteRestorePermissionSchema,
  UpdatePermissionScehma,
  addPermission,
  deletePermission,
  getPermissions,
  restorePermission,
  updatePermission,
  withAuth,
} from "~/utils/permissions";
import { actionHandler, actionResponse } from "~/utils/types/actions";
import { PermissionActions } from "./Actions";

const permissionActionHandlers = {
  [PermissionActions.AddPermission]: handleAddPermission,
  [PermissionActions.UpdatePermission]: handleUpdatePermission,
  [PermissionActions.DeletePermission]: handleDeletePermission,
  [PermissionActions.RestorePermission]: handleRestorePermission,
};

export async function loader({ request }: LoaderFunctionArgs) {
  await withAuth("admin", request);
  return {
    permissions: await getPermissions(true),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  return actionHandler(
    request,
    permissionActionHandlers,
    actionResponse(false, "Invalid action")
  );
}

async function handleAddPermission(formData: FormData) {
  const result = AddPermissionSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid permission data", result.error.flatten())
    );
  }

  const { name, description } = result.data;

  const res = await addPermission({ name, description });
  return json(actionResponse(res.success));
}

async function handleUpdatePermission(formData: FormData) {
  const result = UpdatePermissionScehma.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid permission data", result.error.flatten())
    );
  }

  const { permissionId, ...permissionData } = result.data;

  const res = await updatePermission(permissionId, permissionData);
  return json(actionResponse(res));
}

async function handleDeletePermission(formData: FormData) {
  const result = DeleteRestorePermissionSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid permission id", result.error.flatten())
    );
  }

  const { permissionId } = result.data;
  const res = await deletePermission(Number(permissionId));
  return json(actionResponse(res));
}

async function handleRestorePermission(formData: FormData) {
  const result = DeleteRestorePermissionSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid permission id", result.error.flatten())
    );
  }

  const { permissionId } = result.data;
  const res = await restorePermission(Number(permissionId));
  return json(actionResponse(res));
}
