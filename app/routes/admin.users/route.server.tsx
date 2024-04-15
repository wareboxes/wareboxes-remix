import { ActionFunctionArgs, json } from "@remix-run/node";
import { addRoleToUser, getRoles } from "~/utils/permissions";
import {
  UserUpdateSchema,
  deleteUser,
  deleteUserRole,
  getUsers,
  restoreUser,
  updateUser,
} from "~/utils/users";

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
      return json({ error: "Invalid intent" }, { status: 400 });
  }
}

async function handleUpdate(formData: FormData) {
  const result = UserUpdateSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { error: "Invalid user data", issues: result.error.flatten() };
  }

  const { userId, ...userData } = result.data;
  const res = await updateUser(userId, userData);
  return json({ success: res });
}

async function handleDelete(formData: FormData) {
  const userId = formData.get("userId");

  const res = await deleteUser(Number(userId));
  return json({ success: res });
}

async function handleRestore(formData: FormData) {
  const userId = formData.get("userId");

  const res = await restoreUser(Number(userId));
  return json({ success: res });
}

async function handleAddUserRole(formData: FormData) {
  const { userId, roleId } = Object.fromEntries(formData);
  if (!userId || !roleId) {
    return json(
      { success: false, addUserRoleError: "Invalid user or role" },
      { status: 400 }
    );
  }

  const res = await addRoleToUser(Number(userId), Number(roleId));
  return json({ success: res });
}

async function handleDeleteUserRole(formData: FormData) {
  const { userId, roleId } = Object.fromEntries(formData);

  const res = await deleteUserRole({
    userId: Number(userId),
    roleId: Number(roleId),
  });
  return json({ success: res });
}
