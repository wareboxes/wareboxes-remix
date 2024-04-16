import { Tabs } from "@mantine/core";
import { Link, Outlet, useMatches } from "@remix-run/react";

export const WarehouseManagement = () => {
  const matches = useMatches();
  const currentTab = matches[matches.length - 1].pathname.split("/").pop();

  return (
    <Tabs value={currentTab}>
      <Tabs.List>
        <Tabs.Tab
          value="wms"
          renderRoot={(props) => (
            <Link to="wms" {...props} prefetch="render" />
          )}
        >
          Warehouse Management
        </Tabs.Tab>
      </Tabs.List>
      <Outlet />
    </Tabs>
  );
}