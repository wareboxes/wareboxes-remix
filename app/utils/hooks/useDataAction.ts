import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { notify } from "../notifications";

interface FetcherResponse {
  success: boolean;
  error?: string;
}

interface NotificationMessages {
  successMessage?: string;
  errorMessage?: string;
}

interface ActionOptions<T> {
  dataAction?: T;
  notificationMessages: NotificationMessages;
}

export function useDataAction<T>({
  dataAction,
  notificationMessages,
}: ActionOptions<T>) {
  const fetcher = useFetcher<FetcherResponse>();
  const loading = fetcher.state === "loading";
  const submitting = fetcher.state === "submitting";

  const {
    successMessage = `Item ${dataAction}d successfully`,
    errorMessage = `Item ${dataAction} failed`,
  } = notificationMessages;

  const submit = (formData: FormData) => {
    const action = formData?.get("action") || dataAction;
    if (!action) {
      throw new Error("Action not provided");
    }
    formData?.append("action", action as string);
    fetcher.submit(formData, { method: "POST" });
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      // TODO: Pass success message from the server
      if (fetcher.data.success) {
        notify({
          status: "success",
          title: "Success",
          message: successMessage,
        });
      } else if (fetcher.data.error) {
        // TODO: Pass error message from the server
        notify({
          status: "error",
          title: "Error",
          message: errorMessage,
        });
      }
    }
  }, [fetcher.state, fetcher.data, successMessage, errorMessage]);

  return { ...fetcher, submit, loading, submitting };
}
