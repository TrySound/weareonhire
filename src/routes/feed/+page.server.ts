import { redirect } from "@sveltejs/kit";
import { getDB } from "$lib/db";

export const load = async ({ locals }) => {
  if (!locals.did) {
    redirect(302, "/");
  }

  const db = await getDB();

  // Verify current user is a member
  const currentMember = await db
    .selectFrom("members")
    .select("did")
    .where("did", "=", locals.did)
    .executeTakeFirst();

  if (!currentMember) {
    redirect(302, "/unauthorized");
  }

  // Load all recommendations with author and subject info
  const recommendations = await db
    .selectFrom("recommendations as r")
    .innerJoin("members as author", "r.author_did", "author.did")
    .innerJoin("members as subject", "r.subject_did", "subject.did")
    .select([
      "r.id",
      "r.invitation_id",
      "r.created_at",
      "author.name as author_name",
      "author.handle as author_handle",
      "subject.name as subject_name",
      "subject.handle as subject_handle",
    ])
    .orderBy("r.created_at", "desc")
    .execute();

  return {
    handle: locals.handle,
    recommendations,
  };
};
