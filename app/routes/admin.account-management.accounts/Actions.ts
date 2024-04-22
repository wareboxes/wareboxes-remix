import { useDataAction } from "~/utils/hooks/useDataAction";

export enum AccountActions {
  UpdateAccount = "updateAccount",
  DeleteAccount = "deleteAccount",
  RestoreAccount = "restoreAccount",
}

export function Actions() {
  const updater = useDataAction({
    dataAction: AccountActions.UpdateAccount,
    notificationMessages: {
      successMessage: "Account updated successfully",
    },
  });
  return {
    updater,
  };
}
