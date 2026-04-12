import { error } from "@sveltejs/kit";
import { getDB } from "$lib/db";

export const load = async ({ params, locals, url }) => {
  const { code } = params;

  // Get error from query params if present
  const errorType = url.searchParams.get("error");

  const db = await getDB();

  const invitation = await db
    .selectFrom("invitations")
    .innerJoin("members", "invitations.created_by", "members.did")
    .select([
      "invitations.id",
      "invitations.code",
      "invitations.name",
      "invitations.recommendation_text",
      "invitations.created_at",
      "members.did as inviter_did",
      "members.handle as inviter_handle",
      "members.name as inviter_name",
    ])
    .where("invitations.code", "=", code)
    .whereRef("invitations.used_count", "<", "invitations.max_uses")
    .executeTakeFirst();

  if (!invitation) {
    throw error(404, "Invitation not found");
  }

  let hasAlreadyRecommended = false;
  if (locals.did) {
    const existingRecommendation = await db
      .selectFrom("recommendations")
      .select("id")
      .where("author_did", "=", invitation.inviter_did)
      .where("subject_did", "=", locals.did)
      .executeTakeFirst();
    hasAlreadyRecommended = existingRecommendation !== undefined;
  }

  return {
    handle: locals.handle,
    role: locals.role,
    inviteCode: code,
    errorType,
    invitation: {
      id: invitation.id,
      code: invitation.code,
      name: invitation.name,
      recommendationText: invitation.recommendation_text,
      createdAt: invitation.created_at,
      invitedBy: {
        handle: invitation.inviter_handle,
        name: invitation.inviter_name,
      },
    },
    hasAlreadyRecommended,
  };
};
