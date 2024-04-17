import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  AddDeleteUserRoleSchema,
  addRoleToUser,
  getRoles,
  withAuth,
} from "~/utils/permissions";
import { actionResponse } from "~/utils/types/actions";
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

export async function loader({ request }: LoaderFunctionArgs) {
  await withAuth("admin", request);
  return {
    users: await getUsers(true),
    roles: await getRoles(true, true),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  await withAuth("admin", request);
  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case UserActions.UpdateUser:
      return handleUpdateUser(formData);
    case UserActions.DeleteUser:
      return handleDeleteUser(formData);
    case UserActions.RestoreUser:
      return handleRestoreUser(formData);
    case UserActions.AddUserRole:
      return handleAddUserRole(formData);
    case UserActions.DeleteUserRole:
      return handleDeleteUserRole(formData);
    default:
      return json(actionResponse(false, "Invalid action"));
  }
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
  return json(actionResponse(res));
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
  return json(actionResponse(res));
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
