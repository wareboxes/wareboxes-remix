import { AppShell, AppShellProps } from "@mantine/core";
import { SideMenu } from "./Header/SideMenu/SideMenu";
import { Header } from "./Header/Header";
import { useLocalStorage } from "@mantine/hooks";
import { useRouteLoaderData } from "@remix-run/react";
import { loader } from "~/root";

export function Shell({ children }: { children: React.ReactNode }) {
  const { session } = useRouteLoaderData<typeof loader>("root") ?? {};
  const [navOpen, setNavOpen] = useLocalStorage({
    key: "navOpen",
    defaultValue: true,
  });
  const [layout] = useLocalStorage({
    key: "layout",
    defaultValue: "default",
  });
  const [width] = useLocalStorage({
    key: "navbarWidth",
    defaultValue: 200,
  });

  return (
    <AppShell
      header={{ height: 48 }}
      navbar={{
        width: width,
        breakpoint: "xs",
        collapsed: { mobile: !navOpen, desktop: !navOpen },
      }}
      layout={layout as AppShellProps["layout"]}
      padding="sm"
    >
      <Header navOpen={navOpen} setNavOpen={setNavOpen} />
      {session && (
        <AppShell.Navbar>
          <SideMenu />
        </AppShell.Navbar>
      )}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
