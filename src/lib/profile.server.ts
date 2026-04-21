import { Client, type DatetimeString, type DidString } from "@atproto/lex";
import { Agent } from "@atproto/api";
import * as weareonhire from "$lib/lexicons/com/weareonhire";
import { getOAuthClient } from "./auth";
import { getDB } from "./db";

export interface ProfileData {
  name: string | null;
  title: string | null;
  introduction: string | null;
  countryCode: string | null;
  email?: string | null;
  status?: "open_to_work" | "open_to_connect" | "hidden" | null;
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
    name: profileIndex?.name ?? null,
    title: profileIndex?.title ?? null,
    introduction: profileIndex?.introduction ?? null,
    countryCode: profileIndex?.country_code ?? null,
  };

  if (isOwnProfile) {
    const profilePrivate = await db
      .selectFrom("profile_private")
      .select(["email", "status"])
      .where("did", "=", did)
      .executeTakeFirst();
    result.email = profilePrivate?.email ?? null;
    result.status = profilePrivate?.status ?? null;
  }

  return result;
}

export async function updateProfileData(
  did: string,
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

  // Update com.weareonhire.profile record
  const now = new Date().toISOString() as DatetimeString;
  await client.put(weareonhire.profile.main, {
    createdAt: now,
    name: data.name,
    title: data.title,
    introduction: data.introduction,
    countryCode: data.countryCode,
  });
}
