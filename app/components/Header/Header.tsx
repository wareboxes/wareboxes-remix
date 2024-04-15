import {
  AppShell,
  Avatar,
  Burger,
  Button,
  Group,
  Tooltip,
} from "@mantine/core";
import { Form, useRouteLoaderData } from "@remix-run/react";
import { LightSwitch } from "../LightSwitch";
import { SettingsMenu } from "./SettingsMenu/SettingsMenu";
import { loader } from "~/root";

export function Header({
  navOpen,
  setNavOpen,
}: {
  navOpen: boolean;
  setNavOpen: (value: boolean) => void;
}) {
  const { session } = useRouteLoaderData<typeof loader>("root") ?? {};

  return (
    <AppShell.Header>
      <Group px="sm" h="100%" justify="space-between">
        <Group>
          {session && (
            <Burger opened={navOpen} onClick={() => setNavOpen(!navOpen)} />
          )}
          <div className="text-center justify-center font-bold">Wareboxes</div>
        </Group>
        {session ? (
          <Group>
            <SettingsMenu />
            <Tooltip
              label={`${session.firstName} ${session.lastName}`}
              withArrow
            >
              <Avatar
                src={session?.photos ? session.photos[0].value : undefined}
                alt={`${session.firstName} ${session.lastName}`}
              />
            </Tooltip>
          </Group>
        ) : (
          <Group>
            <Form action="/auth/login" method="post">
              <Button type="submit" variant="light">
                Log in
              </Button>
            </Form>
            <LightSwitch />
          </Group>
        )}
      </Group>
    </AppShell.Header>
  );
}
