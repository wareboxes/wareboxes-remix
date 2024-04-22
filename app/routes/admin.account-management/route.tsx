import { Tabs } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, redirect, useMatches } from "@remix-run/react";
import { withAuth } from "~/utils/permissions";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await withAuth("admin", request);
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname.endsWith("/account-management")) {
    return redirect("/admin/account-management/accounts");
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
          value="accounts"
          renderRoot={(props) => (
            <Link to="accounts" {...props} prefetch="render" />
          )}
        >
          Accounts
        </Tabs.Tab>
        <Tabs.Tab
          value="api-tokens"
          renderRoot={(props) => (
            <Link to="api-tokens" {...props} prefetch="render" />
          )}
        >
          API Tokens
        </Tabs.Tab>
      </Tabs.List>
      <Outlet />
    </Tabs>
  );
}
