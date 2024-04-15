import { Button, Popover, Stack, Switch, Tooltip } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { Form } from "@remix-run/react";
import {
  IconLayoutNavbar,
  IconLayoutSidebar,
  IconLogout2,
  IconSettings2
} from "@tabler/icons-react";
import { LightSwitch } from "../../LightSwitch";

export function SettingsMenu() {
  const [layout, setLayout] = useLocalStorage({
    key: "layout",
    defaultValue: "default",
  });

  const swapLayout = () => {
    setLayout(layout === "default" ? "alt" : "default");
  };
  return (
    <Popover trapFocus position="bottom">
      <Popover.Target>
        <Button>
          <IconSettings2 />
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack justify="center" align="center">
          <Form action="/auth/logout">
            <Tooltip label="Log out" position="left" withArrow>
              <Button type="submit" variant="subtle" color="red">
                <IconLogout2 />
              </Button>
            </Tooltip>
          </Form>
          <Tooltip label="Swap Light/Dark Mode" position="left" withArrow>
            <LightSwitch />
          </Tooltip>
          <Tooltip label="Swap Layout" position="left" withArrow>
            <Switch
              onLabel={<IconLayoutSidebar />}
              offLabel={<IconLayoutNavbar />}
              checked={layout === "default"}
              onChange={swapLayout}
            />
          </Tooltip>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
