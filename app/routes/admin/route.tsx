import { Tabs } from "@mantine/core";
import { Link, Outlet, useMatches } from "@remix-run/react";

export default function UserManagement() {
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
      </Tabs.List>
      <Outlet />
    </Tabs>
  );
}
