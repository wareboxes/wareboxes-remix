import { ActionFunctionArgs, json } from "@remix-run/node";
import {
  DeleteRestoreRoleSchema,
  UpdateRoleSchema,
  deleteRole,
  getRoles,
  restoreRole,
  updateRole,
} from "~/utils/permissions";
import { actionResponse } from "~/utils/types/actions";

export async function loader() {
  return {
    roles: await getRoles(true, true),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "update": {
      return await handleUpdate(formData);
    }
    case "delete": {
      return await handleDelete(formData);
    }
    case "restore": {
      return await handleRestore(formData);
    }
    default:
      return json(actionResponse(false, "Invalid intent"));
  }
}

async function handleUpdate(formData: FormData) {
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

async function handleDelete(formData: FormData) {
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

async function handleRestore(formData: FormData) {
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
