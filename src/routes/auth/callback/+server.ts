import { redirect } from "@sveltejs/kit";
import { sign } from "cookie-signature";
import { Agent } from "@atproto/api";
import { env } from "$env/dynamic/private";
import { getOAuthClient } from "$lib/auth";
import { getDB } from "$lib/db";

const ALLOWED_HANDLES = ["trysound.io"];

export const GET = async ({ url, cookies }) => {
  const oauthClient = await getOAuthClient();
  const { session } = await oauthClient.callback(url.searchParams);

  const agent = new Agent(session);
  const profile = await agent.getProfile({ actor: session.did });
  const handle = profile.data.handle;
  // Check if DID is allowed in the closed community
  if (!ALLOWED_HANDLES.includes(handle)) {
    redirect(302, "/unauthorized");
  }

  // Store both did and handle in the session cookie
  const sessionData = JSON.stringify({ did: session.did, handle });
  const signedSession = sign(sessionData, env.SESSION_PASSWORD);

  cookies.set("session", signedSession, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: !env.DEV,
    // 30 days
    maxAge: 60 * 60 * 24 * 30,
  });

  // Create or update member record with prefilled data
  const db = await getDB();
  const existingMember = await db
    .selectFrom("members")
    .select("did")
    .where("did", "=", session.did)
    .executeTakeFirst();

  if (!existingMember) {
    // New member - create with prefilled name and bio
    await db
      .insertInto("members")
      .values({
        did: session.did,
        handle,
        name: profile.data.displayName,
        summary: profile.data.description,
      })
      .execute();
  } else {
    // Existing member - update handle in case it changed
    await db
      .updateTable("members")
      .set({ handle })
      .where("did", "=", session.did)
      .execute();
  }

  redirect(302, `/profile/${handle}`);
};
