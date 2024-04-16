import {
  Button,
  Group,
  Popover,
  Slider,
  Stack,
  Switch,
  Tooltip
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { Form } from "@remix-run/react";
import {
  IconLayoutNavbar,
  IconLayoutSidebar,
  IconLogout2,
  IconSettings2,
} from "@tabler/icons-react";
import { LightSwitch } from "../../LightSwitch";

export function SettingsMenu() {
  const [layout, setLayout] = useLocalStorage({
    key: "layout",
    defaultValue: "default",
  });
  const [navBarWidth, setNavBarWidth] = useLocalStorage({
    key: "navbarWidth",
    defaultValue: 200,
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
          <Form
            action="/auth/logout"
            onSubmit={(e) => {
              if (!confirm("Are you sure you want to log out?")) {
                e.preventDefault();
              }
            }}
          >
            <Tooltip label="Log out" position="left" withArrow>
              <Button type="submit" variant="subtle" color="red">
                <IconLogout2 />
              </Button>
            </Tooltip>
          </Form>
          <Group>
            <Tooltip label="Swap Light/Dark Mode" position="left" withArrow>
              <div>
                <LightSwitch />
              </div>
            </Tooltip>
            <Tooltip label="Swap Layout" position="left" withArrow>
              <div>
                <Switch
                  onLabel={<IconLayoutSidebar />}
                  offLabel={<IconLayoutNavbar />}
                  checked={layout === "default"}
                  onChange={swapLayout}
                />
              </div>
            </Tooltip>
          </Group>
          <Tooltip label="Navbar Width" position="left" withArrow>
            <div style={{ width: 100 }}>
              <Slider
                min={115}
                max={280}
                step={5}
                value={navBarWidth}
                onChange={setNavBarWidth}
              />
            </div>
          </Tooltip>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
