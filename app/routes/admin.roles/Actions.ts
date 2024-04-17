import { useDataAction } from "~/utils/hooks/useDataAction";

export function Actions() {
  const updater = useDataAction({
    action: "update",
    notificationMessages: {
      successMessage: "Role updated successfully",
    },
  });
  const deleter = useDataAction({
    action: "delete",
    notificationMessages: {
      successMessage: "Role deleted successfully",
    },
  });
  const restorer = useDataAction({
    action: "restore",
    notificationMessages: {
      successMessage: "Role restored successfully",
    },
  });

  return {
    updater,
    deleter,
    restorer,
  };
}
