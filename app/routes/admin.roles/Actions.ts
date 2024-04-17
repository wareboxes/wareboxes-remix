import { useDataAction } from "~/utils/hooks/useDataAction";

export enum RoleActions {
  UpdateRole = "updateRole",
  DeleteRole = "roleDelete",
  RestoreRole = "roleRestore",
  AddChildRole = "addChildRole",
  DeleteChildRole = "deleteChildRole",
}

export function Actions() {
  const updater = useDataAction({
    dataAction: RoleActions.UpdateRole,
    notificationMessages: {
      successMessage: "Role updated successfully",
    },
  });

  return {
    updater,
  };
}
