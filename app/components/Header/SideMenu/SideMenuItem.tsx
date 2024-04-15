import { NavLink } from "@mantine/core";
import { NavLink as Link, useLocation } from "@remix-run/react";
import { SideMenuItem } from "./SideMenuGroups";
import { useState } from "react";

export function SideMenuItem({ item }: { item: SideMenuItem }) {
  const [opened, setOpened] = useState(false);
  const location = useLocation();

  const toggle = () => {
    setOpened(!opened);
  };

  return (
    <>
      {item.items && item.items.length > 0 ? (
        <NavLink
          label={item.label}
          leftSection={item.iconComponent}
          variant="subtle"
          href={`${item.label}`}
          onClick={toggle}
          active={opened}
          opened={opened}
        >
          {item.items.map((childItem: SideMenuItem) => (
            <SideMenuItem item={childItem} key={childItem.label} />
          ))}
        </NavLink>
      ) : (
        <NavLink
          label={item.label}
          href={`${item.href}`}
          leftSection={item.iconComponent}
          renderRoot={(props) => (
            <Link to={item.href} {...props} prefetch="intent" />
          )}
          variant="subtle"
          active={location.pathname === item.href}
        ></NavLink>
      )}
    </>
  );
}
