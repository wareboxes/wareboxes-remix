import { Navigate, useRouteLoaderData } from "@remix-run/react";
import { ReactNode, useMemo } from "react";
import { loader } from "~/root";

export function Protected({
  permissions,
  children,
  redirect,
}: {
  permissions?: string[];
  children: ReactNode;
  redirect?: string;
}) {
  const { session } = useRouteLoaderData<typeof loader>("root") ?? {};

  const permNames = useMemo(() => {
    return session?.userPermissions?.map((perm) => perm.name) ?? [];
  }, [session]);

  if (
    permissions &&
    !permissions.some((perm) => permNames.includes(perm.toUpperCase()))
  ) {
    if (redirect) {
      return <Navigate to={redirect} />;
    }
    return null;
  }

  return <>{children}</>;
}
