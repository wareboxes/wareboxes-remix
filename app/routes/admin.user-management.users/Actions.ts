import { useDataAction } from "~/utils/hooks/useDataAction";

export enum UserActions {
  UpdateUser = "updateUser",
  DeleteUser = "deleteUser",
  RestoreUser = "restoreUser",
  AddUserRole = "addUserRole",
  DeleteUserRole = "deleteUserRole",
}

export function Actions() {
  const updater = useDataAction({
    dataAction: UserActions.UpdateUser,
    notificationMessages: {
      successMessage: "User updated successfully",
    },
  });
  return {
    updater,
  };
}
