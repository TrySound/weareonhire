import * as v from "valibot";
import { error } from "@sveltejs/kit";
import { query, command, form, getRequestEvent } from "$app/server";
import { ResumeSchema } from "./jsonresume";
import { getDB } from "./db";
import { loadResume, updateResume } from "./resume.server";
import { loadSifaResume, updateSifaResume } from "./sifa.server";
import { handleResolver } from "./auth";
import { loadProfile, updateProfileData } from "./profile.server";
import { loadProfileContacts, updateProfileContacts } from "./sifa.server";

export const getProfile = query(
  v.object({ handle: v.string() }),
  async ({ handle }) => {
    const event = getRequestEvent();
    const isOwnProfile = event.locals.handle === handle;
    const did = await handleResolver.resolve(handle);
    if (!did) {
      error(404, `Cannot resolve did from ${handle}`);
    }
    const profile =  await loadProfile(did, isOwnProfile);
    return profile;
  },
);

export const getProfileContacts = query(
  v.object({ handle: v.string() }),
  async ({ handle }) => {
    const did = await handleResolver.resolve(handle);
    if (!did) {
      error(404, `Cannot resolve did from ${handle}`);
    }
    const contacts = await loadProfileContacts(did);
    return {
      contacts,
    };
  },
);

const ProfileSchema = v.object({
  name: v.optional(v.string()),
  title: v.optional(v.string()),
  introduction: v.optional(v.string()),
  countryCode: v.optional(v.string()),
  email: v.optional(v.string()),
  status: v.optional(
    v.union([
      v.literal("open_to_work"),
      v.literal("open_to_connect"),
      v.literal("hidden"),
    ]),
  ),
  contacts: v.optional(v.array(v.string())),
});

export type Profile = v.InferOutput<typeof ProfileSchema>;

export const updateProfile = form(
  ProfileSchema,
  async ({
    name,
    title,
    introduction,
    countryCode,
    email,
    status,
    contacts,
  }) => {
    const event = getRequestEvent();
    const did = event.locals.did;
    const handle = event.locals.handle;

    if (!did || !handle) {
      error(401, "Unauthorized");
    }

    // Update profile data in database and AT Protocol
    await updateProfileData(did, {
      name,
      title,
      introduction,
      countryCode,
      email,
      status,
    });

    // Update contacts in SIFA external accounts
    await updateProfileContacts(did, contacts ?? []);

    // Refresh the profile query to reflect changes
    getProfile({ handle }).refresh();
    getProfileContacts({ handle }).refresh();
  },
);

// Legacy functions for resume page
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
