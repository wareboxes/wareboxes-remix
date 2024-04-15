import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/utils/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const env = process.env;
  const session = await getSession(request.headers.get("Cookie"));
  const logoutURL = new URL(env.AUTH0_LOGOUT_URL ?? "");

  logoutURL.searchParams.set("client_id", env.AUTH0_CLIENT_ID ?? "");
  logoutURL.searchParams.set("returnTo", env.AUTH0_LOGOUT_REDIRECT ?? "");

  return redirect(logoutURL.toString(), {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
