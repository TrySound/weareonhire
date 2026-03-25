import { redirect } from "@sveltejs/kit";
import { sign } from "cookie-signature";
import { Agent } from "@atproto/api";
import { env } from "$env/dynamic/private";
import { getOAuthClient } from "$lib/auth";

export const GET = async ({ url, cookies }) => {
  const oauthClient = await getOAuthClient();
  const { session } = await oauthClient.callback(url.searchParams);

  const signedSession = sign(session.did, env.SESSION_PASSWORD);

  cookies.set("session", signedSession, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: !env.DEV,
    // 30 days
    maxAge: 60 * 60 * 24 * 30,
  });

  const agent = new Agent(session);
  const profile = await agent.getProfile({ actor: session.did });
  const handle = profile.data.handle;

  redirect(302, `/profile/${handle}`);
};
