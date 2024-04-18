import { Tabs } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, redirect, useMatches } from "@remix-run/react";
import { withAuth } from "~/utils/permissions";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await withAuth("admin", request);
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname.endsWith("/admin")) {
    return redirect("/admin/users");
  }
  return null;
};

export default function Admin() {
  const matches = useMatches();
  const currentTab = matches[matches.length - 1].pathname.split("/").pop();

  return (
    <Tabs value={currentTab}>
      <Tabs.List>
        <Tabs.Tab
          value="users"
          renderRoot={(props) => (
            <Link to="users" {...props} prefetch="render" />
          )}
        >
          Users
        </Tabs.Tab>
        <Tabs.Tab
          value="roles"
          renderRoot={(props) => (
            <Link to="roles" {...props} prefetch="render" />
          )}
        >
          Roles
        </Tabs.Tab>
        <Tabs.Tab
          value="permissions"
          renderRoot={(props) => (
            <Link to="permissions" {...props} prefetch="render" />
          )}
        >
          Permissions
        </Tabs.Tab>
      </Tabs.List>
      <Outlet />
    </Tabs>
  );
}
