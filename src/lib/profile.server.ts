import { Client, type DatetimeString, type DidString } from "@atproto/lex";
import { Agent } from "@atproto/api";
import * as weareonhire from "$lib/lexicons/com/weareonhire";
import * as sifa from "$lib/lexicons/id/sifa";
import { getOAuthClient } from "./auth";
import { getDB } from "./db";

export interface ProfileData {
  name: string | undefined;
  title: string | undefined;
  introduction: string | undefined;
  countryCode: string | undefined;
  email?: string | undefined;
  status?: "open_to_work" | "open_to_connect" | "hidden" | undefined;
}

export async function loadProfile(
  did: DidString,
  isOwnProfile: boolean,
): Promise<ProfileData> {
  const db = await getDB();

  // Load public profile data from profile_index
  const profileIndex = await db
    .selectFrom("profile_index")
    .select(["name", "title", "introduction", "country_code"])
    .where("did", "=", did)
    .executeTakeFirst();

  const result: ProfileData = {
    name: profileIndex?.name ?? undefined,
    title: profileIndex?.title ?? undefined,
    introduction: profileIndex?.introduction ?? undefined,
    countryCode: profileIndex?.country_code ?? undefined,
  };

  if (isOwnProfile) {
    const profilePrivate = await db
      .selectFrom("profile_private")
      .select(["email", "status"])
      .where("did", "=", did)
      .executeTakeFirst();
    result.email = profilePrivate?.email ?? undefined;
    result.status = profilePrivate?.status ?? undefined;
  }

  return result;
}

export async function updateProfileData(
  did: DidString,
  data: {
    name?: string;
    title?: string;
    introduction?: string;
    countryCode?: string;
    email?: string;
    status?: "open_to_work" | "open_to_connect" | "hidden";
  },
): Promise<void> {
  const db = await getDB();

  await db.transaction().execute(async (trx) => {
    // Update profile_index table
    await trx
      .insertInto("profile_index")
      .values({
        did,
        name: data.name ?? null,
        title: data.title ?? null,
        introduction: data.introduction ?? null,
        country_code: data.countryCode ?? null,
        created_at: new Date().toISOString(),
      })
      .onConflict((oc) =>
        oc.column("did").doUpdateSet({
          name: data.name ?? null,
          title: data.title ?? null,
          introduction: data.introduction ?? null,
          country_code: data.countryCode ?? null,
        }),
      )
      .execute();

    // Update profile_private table
    await trx
      .insertInto("profile_private")
      .values({
        did,
        email: data.email ?? null,
        status: data.status ?? "hidden",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .onConflict((oc) =>
        oc.column("did").doUpdateSet({
          email: data.email ?? null,
          status: data.status ?? "hidden",
          updated_at: new Date().toISOString(),
        }),
      )
      .execute();
  });

  // Create typed client with authenticated session
  const oauthClient = await getOAuthClient();
  const session = await oauthClient.restore(did);
  const client = new Client(new Agent(session));

  // Get current sifa profile to preserve summary
  let currentSummary: string | undefined;
  try {
    const existingProfile = await client.get(sifa.profile.self.main, {
      rkey: "self",
      repo: did,
    });
    currentSummary = existingProfile.value.about;
  } catch {
    // Profile doesn't exist yet
  }

  // Update com.weareonhire.profile record
  const now = new Date().toISOString() as DatetimeString;
  await client.put(weareonhire.profile.main, {
    createdAt: now,
    name: data.name,
    title: data.title,
    introduction: data.introduction,
    countryCode: data.countryCode,
  });
  await client.put(sifa.profile.self.main, {
    createdAt: now,
    headline: data.title,
    about: currentSummary,
    location: data.countryCode ? { countryCode: data.countryCode } : undefined,
  });
}
