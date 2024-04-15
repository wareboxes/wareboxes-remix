import {
  IconBuildingWarehouse,
  IconChartArea,
  IconClipboard,
  IconLock,
  IconLockAccess,
  IconMail,
  IconMap,
  IconPackage,
  IconPackageExport,
  IconRollerSkating,
  IconSettings2,
  IconSettingsBolt,
  IconTruck,
  IconUser,
} from "@tabler/icons-react";

export type SideMenuItem = {
  label: string;
  iconComponent: React.ReactNode;
  href?: string;
  items?: SideMenuItem[];
};

export const sidebarGroups = [
  {
    label: "Dashboard",
    iconComponent: <IconChartArea />,
    href: "/dashboard",
  },
  {
    label: "WMS",
    iconComponent: <IconBuildingWarehouse />,
    items: [
      {
        label: "Orders",
        href: "/wms/orders",
        iconComponent: <IconClipboard />,
      },
      {
        label: "Inventory",
        href: "/wms/inventory",
        iconComponent: <IconPackage />,
      },
      {
        label: "Locations",
        href: "/wms/locations",
        iconComponent: <IconMap />,
      },
      {
        label: "Products",
        href: "/wms/products",
        iconComponent: <IconPackageExport />,
      },
    ],
  },
  {
    label: "Administration",
    iconComponent: <IconLock />,
    items: [
      {
        label: "User Management",
        iconComponent: <IconLockAccess />,
        items: [
          {
            label: "Users",
            href: "/admin/users",
            iconComponent: <IconUser />,
          },
          {
            label: "Roles",
            href: "/admin/roles",
            iconComponent: <IconRollerSkating />,
          },
          {
            label: "Permissions",
            href: "/admin/permissions",
            iconComponent: <IconLockAccess />,
          },
        ],
      },

      {
        label: "Configuration",
        iconComponent: <IconSettings2 />,
        items: [
          {
            label: "Carrier",
            href: "/admin/configuration/carrier",
            iconComponent: <IconTruck />,
          },
          {
            label: "Email",
            href: "/admin/configuration/email",
            iconComponent: <IconMail />,
          },
          {
            label: "System",
            href: "/admin/configuration/system",
            iconComponent: <IconSettingsBolt />,
          },
        ],
      },
    ],
  },
] as SideMenuItem[];
