import { Loader } from "@mantine/core";
import { ClientOnly } from "remix-utils/client-only";

export const LocaleTimeCell = ({ value }: { value?: string }) => {

  if (!value) {
    return null;
  }
  return (
    <ClientOnly fallback={<Loader />}>
      {() => new Date(value).toLocaleString()}
    </ClientOnly>
  );
}