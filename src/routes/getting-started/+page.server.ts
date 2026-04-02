import { redirect, fail } from "@sveltejs/kit";
import { getDB } from "$lib/db";

export const load = async ({ locals }) => {
  if (!locals.did || !locals.handle) {
    redirect(302, "/");
  }

  const db = await getDB();

  // Verify user is a member
  const member = await db
    .selectFrom("members")
    .select(["did", "invited_by"])
    .where("did", "=", locals.did)
    .executeTakeFirst();

  if (!member) {
    redirect(302, "/unauthorized");
  }

  // Check if user has uploaded resume (has positions)
  const positionsCount = await db
    .selectFrom("member_positions")
    .select((eb) => eb.fn.count("id").as("count"))
    .where("did", "=", locals.did)
    .executeTakeFirst()
    .then((result) => parseInt(result?.count?.toString() ?? "0", 10));

  const hasResume = positionsCount > 0;

  // Check if user has sent recommendation back to inviter
  let hasRecommendedBack = true;
  if (member.invited_by) {
    const recommendation = await db
      .selectFrom("recommendations")
      .select("id")
      .where("author_did", "=", locals.did)
      .where("subject_did", "=", member.invited_by)
      .executeTakeFirst();
    hasRecommendedBack = recommendation !== undefined;
  }

  // Check if user has sent at least one invite
  const invitesCount = await db
    .selectFrom("invitations")
    .select((eb) => eb.fn.count("id").as("count"))
    .where("created_by", "=", locals.did)
    .executeTakeFirst()
    .then((result) => parseInt(result?.count?.toString() ?? "0", 10));

  const hasInvited = invitesCount > 0;

  // Get inviter info if user was invited
  let inviter = null;
  if (member.invited_by) {
    const inviterData = await db
      .selectFrom("members")
      .select(["name", "handle"])
      .where("did", "=", member.invited_by)
      .executeTakeFirst();

    if (inviterData) {
      inviter = {
        name: inviterData.name,
        handle: inviterData.handle,
      };
    }
  }

  return {
    handle: locals.handle,
    hasResume,
    hasRecommendedBack,
    hasInvited,
    inviter,
  };
};

export const actions = {
  recommend: async ({ request, locals }) => {
    if (!locals.did) {
      return fail(401, { error: "Not authenticated" });
    }

    const db = await getDB();

    // Get current member to find inviter
    const member = await db
      .selectFrom("members")
      .select(["invited_by"])
      .where("did", "=", locals.did)
      .executeTakeFirst();

    if (!member?.invited_by) {
      return fail(400, { error: "You were not invited by anyone" });
    }

    // Check if already recommended back
    const existingRecommendation = await db
      .selectFrom("recommendations")
      .select("id")
      .where("author_did", "=", locals.did)
      .where("subject_did", "=", member.invited_by)
      .executeTakeFirst();

    if (existingRecommendation) {
      return fail(400, {
        error: "You already recommended back to this person",
      });
    }

    const formData = await request.formData();
    const text = formData.get("text")?.toString().trim() ?? "";

    if (text.length < 200) {
      return fail(400, {
        error: "Recommendation should be at least 200 characters long",
      });
    }

    // Create the recommendation
    await db
      .insertInto("recommendations")
      .values({
        author_did: locals.did,
        subject_did: member.invited_by,
        text,
      })
      .execute();

    return { success: true };
  },
};
