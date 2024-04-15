import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { NavigationProgress } from "@mantine/nprogress";
import "@mantine/nprogress/styles.css";
import "mantine-react-table/styles.css";
import "./tailwind.css";
// eslint-disable-next-line import/no-unresolved
import { LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Shell } from "./components/Shell";
import { auth } from "./utils/auth";
import useNavigationProgress from "./utils/hooks/useNavigationProgress";
import { ModalsProvider } from "@mantine/modals";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.isAuthenticated(request);
  return json({ session });
}

export function Layout({ children }: { children: React.ReactNode }) {
  useNavigationProgress();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark">
          <NavigationProgress />
          <ModalsProvider />
          <Notifications autoClose={4000} />
          <Shell>{children}</Shell>
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
