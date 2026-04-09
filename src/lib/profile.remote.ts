import * as v from "valibot";
import { error } from "@sveltejs/kit";
import { query, command, getRequestEvent } from "$app/server";
import { ResumeSchema } from "./jsonresume";
import { loadResume, updateResume } from "./resume.server";

export const getMemberProfile = query(
  v.object({ handle: v.string() }),
  async ({ handle }) => {
    const event = getRequestEvent();
    if (!event.locals.did) {
      error(401);
    }

    const resume = await loadResume(handle);
    if (!resume) {
      error(404, "Member not found");
    }

    return resume;
  },
);

export const updateMemberProfile = command(ResumeSchema, async (resume) => {
  const event = getRequestEvent();
  const did = event.locals.did;
  if (!did || !event.locals.handle) {
    error(401, "Unauthorized");
  }

  await updateResume(did, resume);

  // Refresh the profile query to reflect changes
  getMemberProfile({ handle: event.locals.handle }).refresh();
});
