import { NavLink, Tooltip } from "@mantine/core";
import { NavLink as Link, useLocation } from "@remix-run/react";
import { SideMenuItem as SideMenuItemT } from "./SideMenuGroups";
import { useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "@mantine/hooks";

export function SideMenuItem({ item }: { item: SideMenuItemT }) {
  const [navBarWidth] = useLocalStorage({
    key: "navbarWidth",
    defaultValue: 200,
  });
  const [opened, setOpened] = useState(false);
  const location = useLocation();

  const toggle = useCallback(() => {
    setOpened(!opened);
  }, [opened]);

  const hideLabelSize = useMemo(() => {
    return 140;
  }, []);

  return (
    <>
      {item.items && item.items.length > 0 ? (
        <Tooltip
          label={item.label}
          position="right"
          withArrow
          disabled={navBarWidth >= hideLabelSize}
        >
          <NavLink
            childrenOffset={navBarWidth / 10}
            label={navBarWidth >= hideLabelSize ? item.label : undefined}
            leftSection={item.iconComponent}
            variant="subtle"
            onClick={toggle}
            active={opened}
            opened={opened}
            fz="xs"
            lh="xs"
          >
            {item.items.map((childItem: SideMenuItemT) => (
              <SideMenuItem item={childItem} key={childItem.label} />
            ))}
          </NavLink>
        </Tooltip>
      ) : (
        <Tooltip
          label={item.label}
          position="right"
          withArrow
          disabled={navBarWidth >= hideLabelSize}
        >
          <NavLink
            label={navBarWidth >= hideLabelSize ? item.label : undefined}
            href={`${item.href}`}
            leftSection={item.iconComponent}
            renderRoot={(props) => (
              <Link to={item.href} {...props} prefetch="intent" />
            )}
            variant="subtle"
            active={location.pathname === item.href}
            fz="xs"
            lh="xs"
          ></NavLink>
        </Tooltip>
      )}
    </>
  );
}
