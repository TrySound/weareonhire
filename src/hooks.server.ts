import { Agent } from "@atproto/api";
import { getOAuthClient } from "$lib/auth";
import { unsign } from "cookie-signature";
import { env } from "$env/dynamic/private";

export const handle = async ({ event, resolve }) => {
  const signedSession = event.cookies.get("session");

  if (signedSession) {
    const did = unsign(signedSession, env.SESSION_PASSWORD);

    if (did) {
      try {
        const oauthClient = await getOAuthClient();
        const oauthSession = await oauthClient.restore(did);
        event.locals.agent = new Agent(oauthSession);
        event.locals.did = did;
      } catch {
        event.cookies.delete("session", { path: "/" });
      }
    } else {
      event.cookies.delete("session", { path: "/" });
    }
  }

  return resolve(event);
};
