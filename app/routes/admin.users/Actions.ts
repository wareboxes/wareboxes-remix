import { useDataAction } from "~/utils/hooks/useDataAction";

export function Actions() {
  const updater = useDataAction({
    action: "update",
    notificationMessages: {
      successMessage: "User updated successfully",
    },
  });
  const deleter = useDataAction({
    action: "delete",
    notificationMessages: {
      successMessage: "User deleted successfully",
    },
  });
  const restorer = useDataAction({
    action: "restore",
    notificationMessages: {
      successMessage: "User restored successfully",
    },
  });

  return {
    updater,
    deleter,
    restorer,
  };
}