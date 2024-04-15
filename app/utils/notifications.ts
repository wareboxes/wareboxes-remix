import { notifications } from "@mantine/notifications";

interface NotifyProps {
  status: "success" | ("fail" | "error") | "warning" | "info";
  title: string;
  message: string;
  autoClose?: number;
}

export async function notify({
  status,
  title,
  message,
  autoClose = 5000,
}: NotifyProps) {
  const statusToColorMap = {
    info: "blue",
    success: "green",
    fail: "red",
    error: "red",
    warning: "yellow",
  };

  const color = statusToColorMap[status];
  notifications.show({ color, title, message, autoClose });
}
