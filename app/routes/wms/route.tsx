import { Tabs } from "@mantine/core";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, Outlet, useMatches } from "@remix-run/react";
import { withAuth } from "~/utils/permissions";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await withAuth("wms", request);
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname.endsWith("/wms")) {
    return redirect("/wms/orders");
  }
  return null;
};

export default function WarehouseManagement() {
  const matches = useMatches();
  const currentTab = matches[matches.length - 1].pathname.split("/").pop();

  return (
    <Tabs value={currentTab}>
      <Tabs.List>
        <Tabs.Tab
          value="orders"
          renderRoot={(props) => (
            <Link to="orders" {...props} prefetch="render" />
          )}
        >
          Orders
        </Tabs.Tab>
        <Tabs.Tab
          value="products"
          renderRoot={(props) => (
            <Link to="products" {...props} prefetch="render" />
          )}
        >
          Items
        </Tabs.Tab>
      </Tabs.List>
      <Outlet />
    </Tabs>
  );
}