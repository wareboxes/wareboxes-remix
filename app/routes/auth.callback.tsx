import { auth } from "~/utils/auth";

export async function loader({
  request,
}: {
  request: Request;
}): Promise<Response> {
  return auth.authenticate("auth0", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/",
  });
}
