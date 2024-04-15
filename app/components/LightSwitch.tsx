import {
  useMantineTheme,
  useMantineColorScheme,
  rem,
  Switch,
} from "@mantine/core";
import { IconSun, IconMoonStars } from "@tabler/icons-react";
import { useMemo, useCallback } from "react";

export function LightSwitch() {
  const theme = useMantineTheme();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const sunIcon = useMemo(
    () => (
      <IconSun
        style={{ width: rem(16), height: rem(16) }}
        stroke={2.5}
        color={theme.colors.yellow[4]}
      />
    ),
    [theme.colors.yellow]
  );

  const moonIcon = useMemo(
    () => (
      <IconMoonStars
        style={{ width: rem(16), height: rem(16) }}
        stroke={2.5}
        color={theme.colors.blue[6]}
      />
    ),
    [theme.colors.blue]
  );

  const toggleDarkMode = useCallback(() => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  }, [colorScheme, setColorScheme]);
  return (
    <Switch
      onLabel={sunIcon}
      offLabel={moonIcon}
      checked={colorScheme === "dark"}
      onChange={toggleDarkMode}
    />
  );
}
