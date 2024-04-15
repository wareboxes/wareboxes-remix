import { ActionFunctionArgs, json } from "@remix-run/node";
import { UpdateRoleSchema, deleteRole, getRoles, restoreRole, updateRole } from "~/utils/permissions";

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
      return json({ error: "Invalid intent" }, { status: 400 });
  }
}

async function handleUpdate(formData: FormData) {
  const result = UpdateRoleSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { error: "Invalid role data", issues: result.error.flatten() };
  }

  const { roleId, ...roleData } = result.data;
  const success = await updateRole(roleId, roleData);
  return json({ success });
}

async function handleDelete(formData: FormData) {
  const roleId = formData.get("roleId");

  const success = await deleteRole(Number(roleId));
  return json({ success });
}

async function handleRestore(formData: FormData) {
  const roleId = formData.get("roleId");

  const success = await restoreRole(Number(roleId));
  return json({ success });
}