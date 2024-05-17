import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { withAuth } from "~/utils/permissions";
import { actionHandler, actionResponse } from "~/utils/types/actions";
import {
  DeleteRestoreUserSchema,
  UserUpdateSchema,
  deleteUser,
  deleteUserRole,
  getUsers,
  restoreUser,
  updateUser,
} from "~/utils/users";
import { UserActions } from "./Actions";
import {
  getRoles,
  AddDeleteUserRoleSchema,
  addRoleToUser,
} from "~/utils/roles";

const userActionHandlers = {
  [UserActions.UpdateUser]: handleUpdateUser,
  [UserActions.DeleteUser]: handleDeleteUser,
  [UserActions.RestoreUser]: handleRestoreUser,
  [UserActions.AddUserRole]: handleAddUserRole,
  [UserActions.DeleteUserRole]: handleDeleteUserRole,
};

export async function loader({ request }: LoaderFunctionArgs) {
  await withAuth("admin", request);
  return {
    users: (await getUsers(true)).data,
    roles: (await getRoles(true, true)).data,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  await withAuth("admin", request);
  return actionHandler(
    request,
    userActionHandlers,
    actionResponse(false, "Invalid action")
  );
}

async function handleUpdateUser(formData: FormData) {
  const result = UserUpdateSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return json(
      actionResponse(false, "Invalid user data", result.error.flatten())
    );
  }

  const { userId, ...userData } = result.data;
  const res = await updateUser(userId, userData);
  return json(actionResponse(res.success, res.errors?.[0], res.data));
}

async function handleDeleteUser(formData: FormData) {
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
  return json(actionResponse(res.success, res.errors?.[0]));
}

async function handleRestoreUser(formData: FormData) {
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
  return json(actionResponse(res.success, res.errors?.[0]));
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
  return json(actionResponse(res.success, res.errors?.[0]));
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
  return json(actionResponse(res.success, res.errors?.[0]));
}
