import type { LoaderFunctionArgs } from "@remix-run/node";
import { auth } from "~/utils/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  return await auth.isAuthenticated(request, {
    successRedirect: "/dashboard",
  });
}

export default function Index() {
  return <div>INDEX</div>;
}
