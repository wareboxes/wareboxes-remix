import { useRouteLoaderData } from "@remix-run/react";
import { Protected } from "~/components/Protected";
import { loader } from "~/root";
import { sidebarGroups } from "./SideMenuGroups";
import { SideMenuItem } from "./SideMenuItem";

export function SideMenu() {
  const { session } = useRouteLoaderData<typeof loader>("root") ?? {};

  if (!session) return null;
  return (
    <>
      {sidebarGroups.map((item, index) => (
        <Protected key={index} permissions={item.permissions}>
          <SideMenuItem item={item} key={item.label} />
        </Protected>
      ))}
    </>
  );
}
