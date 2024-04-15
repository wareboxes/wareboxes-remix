import { ActionFunctionArgs, json } from "@remix-run/node";
import {
  AddDeleteUserRoleSchema,
  addRoleToUser,
  getRoles,
} from "~/utils/permissions";
import {
  DeleteRestoreUserSchema,
  UserUpdateSchema,
  deleteUser,
  deleteUserRole,
  getUsers,
  restoreUser,
  updateUser,
} from "~/utils/users";

export interface ActionResponse {
  success: boolean;
  error: string | null;
  issues: Record<string, unknown> | null;
}

function actionResponse(
  success: boolean = false,
  error: string | null = null,
  issues: Record<string, unknown> | null = null
): ActionResponse {
  return {
    success,
    error,
    issues,
  };
}

export async function loader() {
  return {
    users: await getUsers(true),
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
    case "addUserRole": {
      return await handleAddUserRole(formData);
    }
    case "deleteUserRole": {
      return await handleDeleteUserRole(formData);
    }
    default:
      return json(actionResponse(false, "Invalid intent"));
  }
}

async function handleUpdate(formData: FormData) {
  const result = UserUpdateSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid user data", result.error.flatten())
    );
  }

  const { userId, ...userData } = result.data;
  const res = await updateUser(userId, userData);
  return json(actionResponse(res));
}

async function handleDelete(formData: FormData) {
  const result = DeleteRestoreUserSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid user data", result.error.flatten())
    );
  }

  const { userId } = result.data;
  const res = await deleteUser(Number(userId));
  return json(actionResponse(res));
}

async function handleRestore(formData: FormData) {
  const result = DeleteRestoreUserSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid user data", result.error.flatten())
    );
  }

  const { userId } = result.data;
  const res = await restoreUser(Number(userId));
  return json(actionResponse(res));
}

async function handleAddUserRole(formData: FormData) {
  const result = AddDeleteUserRoleSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return json(actionResponse(false, "Invalid data", result.error.flatten()));
  }

  const { userId, roleId } = result.data;
  const res = await addRoleToUser(Number(userId), Number(roleId));
  return json(actionResponse(res));
}

async function handleDeleteUserRole(formData: FormData) {
  const result = AddDeleteUserRoleSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!result.success) {
    return json(actionResponse(false, "Invalid data", result.error.flatten()));
  }

  const { userId, roleId } = result.data;
  const res = await deleteUserRole({
    userId: Number(userId),
    roleId: Number(roleId),
  });
  return json(actionResponse(res));
}
