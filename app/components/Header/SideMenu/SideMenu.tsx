import { sidebarGroups } from "./SideMenuGroups";
import { SideMenuItem } from "./SideMenuItem";
import { useRouteLoaderData } from "@remix-run/react";
import { loader } from "~/root";

export function SideMenu() {
  const { session } = useRouteLoaderData<typeof loader>("root") ?? {};
  if (!session) return null;
  return (
    <>
      {sidebarGroups.map((item) => (
        <SideMenuItem item={item} key={item.label} />
      ))}
    </>
  );
}
