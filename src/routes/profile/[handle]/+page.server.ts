import { error } from "@sveltejs/kit";
import type { AtIdentifierString } from "@atproto/lex";
import { getPublicClient } from "$lib/auth";
import { bsky } from "$lib/lexicons/app";

export const load = async ({ params }) => {
  const { handle } = params;

  const client = getPublicClient();

  try {
    const profile = await client.call(bsky.actor.getProfile.main, {
      actor: handle as AtIdentifierString,
    });

    // Extract required fields for the profile page
    return {
      profile: {
        did: profile.did,
        handle: profile.handle,
        displayName: profile.displayName,
        avatar: profile.avatar,
      },
    };
  } catch (err) {
    // Check if it's a 404 (profile not found)
    if (
      err &&
      typeof err === "object" &&
      "status" in err &&
      err.status === 404
    ) {
      throw error(404, "Profile not found");
    }

    // Handle other errors
    throw error(500, "Failed to fetch profile");
  }
};
