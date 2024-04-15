import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { notify } from "../notifications";

interface FetcherResponse {
  success: boolean;
  error?: string;
}

interface NotificationMessages {
  successMessage?: string;
  errorMessage?: string;
}

interface ActionOptions {
  action: string;
  notificationMessages: NotificationMessages;
}

export function useDataAction({ action, notificationMessages }: ActionOptions) {
  const {
    successMessage = `Item ${action}d successfully`,
    errorMessage = `Item ${action} failed`,
  } = notificationMessages;

  const fetcher = useFetcher<FetcherResponse>();
  const [loading, setLoading] = useState(false);

  const performAction = (formData: FormData) => {
    setLoading(true);
    const intent = formData.get("intent");
    if (!intent) formData.append("intent", action);
    fetcher.submit(formData, { method: "POST" });
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      setLoading(false);
      if (fetcher.data?.success) {
        notify({
          status: "success",
          title: "Success",
          message: successMessage,
        });
      } else if (fetcher.data?.error) {
        notify({
          status: "error",
          title: "Error",
          message: errorMessage,
        });
      }
    }
  }, [fetcher.state, fetcher.data, successMessage, errorMessage]);

  return { performAction, loading };
}