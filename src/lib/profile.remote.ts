import * as v from "valibot";
import { error } from "@sveltejs/kit";
import { query, command, getRequestEvent } from "$app/server";
import { ResumeSchema } from "./jsonresume";
import { loadResume, updateResume } from "./resume.server";
import { loadSifaResume, updateSifaResume } from "./sifa.server";
import { handleResolver } from "./auth";
import { getDB } from "./db";

export const getMemberProfile = query(
  v.object({ handle: v.string() }),
  async ({ handle }) => {
    const { locals } = getRequestEvent();
    const did = await handleResolver.resolve(handle);
    if (!did) {
      error(404);
    }
    // show local resume and fallback to sifa resume
    const isOwnProfile = did === locals.did;
    return (await loadResume(did)) ?? (await loadSifaResume(did, isOwnProfile));
  },
);

export const updateMemberProfile = command(ResumeSchema, async (resume) => {
  const { locals } = getRequestEvent();
  const did = locals.did;
  const handle = locals.handle;
  if (!did || !handle) {
    error(401, "Unauthorized");
  }

  // Check if user is a member (exists in local database)
  const db = await getDB();
  const member = await db
    .selectFrom("members")
    .select("did")
    .where("did", "=", did)
    .executeTakeFirst();

  // update legacy members
  if (member) {
    await updateResume(did, resume);
  }
  // update atproto + private data
  await updateSifaResume(did, resume);

  // Refresh the profile query to reflect changes
  getMemberProfile({ handle }).refresh();
});
