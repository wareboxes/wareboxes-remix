import { createCookieSessionStorage } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import { Auth0Profile, Auth0Strategy } from "remix-auth-auth0";
import type { SelectUser as User } from "~/utils/types/db/users";
import { addUser } from "./users";

const env = process.env;

export type SessionUser = Partial<Auth0Profile> & User;

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    path: "/",
    sameSite: "lax",
    secrets: [env.REMIX_AUTH_SECRET ?? ""],
    secure: env.NODE_ENV === "production",
  },
});

export const auth = new Authenticator<Partial<SessionUser>>(
  sessionStorage,
  { throwOnError: true }
);

const auth0Strategy = new Auth0Strategy<SessionUser>(
  {
    callbackURL: env.AUTH0_RETURN_TO ?? "",
    clientID: env.AUTH0_CLIENT_ID ?? "",
    clientSecret: env.AUTH0_CLIENT_SECRET ?? "",
    domain: env.AUTH0_ISSUER ?? "",
  },
  async ({ profile }) => {
    if (!profile.emails) {
      throw new Error("No email found in profile");
    }
    const userRes = await addUser(profile.emails[0].value);
    if (!userRes.success) {
      throw new Error("Failed to create or retrieve user");
    }
    return { ...profile, ...userRes.data } as SessionUser;
  }
);

auth.use(auth0Strategy);

export const { getSession, commitSession, destroySession } = sessionStorage;
