import { redirect, error } from "@sveltejs/kit";
import type { HandleString } from "@atproto/lex";
import { getDB } from "$lib/db";

export const load = async ({ params, locals }) => {
  const currentDid = locals.did;
  if (!currentDid) {
    redirect(302, "/");
  }

  // Verify current user is a member
  const db = await getDB();
  const currentMember = await db
    .selectFrom("members")
    .select("handle")
    .where("did", "=", currentDid)
    .executeTakeFirst();
  if (!currentMember) {
    redirect(302, "/unauthorized");
  }

  // Get the handle from params
  const profileHandle = params.handle as HandleString;

  const profileMember = await db
    .selectFrom("members")
    .selectAll()
    .where("handle", "=", profileHandle)
    .executeTakeFirst();
  if (!profileMember) {
    error(404, "Member not found");
  }

  return {
    handle: currentMember.handle,
    profile: {
      handle: profileMember.handle,
      did: profileMember.did,
    },
  };
};
