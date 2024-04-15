import { redirect, ActionFunctionArgs } from "@remix-run/node";

import { auth } from "~/utils/auth";

export async function loader() {
  return redirect("/");
}

export function action({ request }: ActionFunctionArgs) {
  return auth.authenticate("auth0", request);
}
