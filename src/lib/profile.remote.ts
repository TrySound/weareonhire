import * as v from "valibot";
import { error } from "@sveltejs/kit";
import { query, command, getRequestEvent } from "$app/server";
import { getDB } from "./db";
import { ResumeSchema } from "./resume-schema";
import { loadResume } from "./resume.server";

const normalizeUrl = (url: string) => {
  if (url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

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

  const db = await getDB();

  await db.transaction().execute(async (trx) => {
    // Update member profile
    await trx
      .updateTable("members")
      .set({
        name: resume.profile.name || null,
        email: resume.profile.email || null,
        location: resume.profile.location || null,
        headline: resume.profile.headline || null,
        summary: resume.profile.summary || null,
        industry: resume.profile.industry || null,
        website: resume.profile.website || null,
        updated_at: new Date().toISOString(),
      })
      .where("did", "=", did)
      .execute();

    // Delete existing related records
    await trx.deleteFrom("member_positions").where("did", "=", did).execute();
    await trx.deleteFrom("member_education").where("did", "=", did).execute();
    await trx.deleteFrom("member_projects").where("did", "=", did).execute();
    await trx.deleteFrom("member_skills").where("did", "=", did).execute();
    await trx.deleteFrom("member_languages").where("did", "=", did).execute();
    await trx
      .deleteFrom("member_preferred_workplaces")
      .where("did", "=", did)
      .execute();
    await trx.deleteFrom("member_profiles").where("did", "=", did).execute();

    if (resume.positions.length > 0) {
      await trx
        .insertInto("member_positions")
        .values(
          resume.positions.map((p) => ({
            did,
            company: p.company,
            title: p.title,
            location: p.location || null,
            workplace_type: p.workplaceType || null,
            employment_type: p.employmentType || null,
            started_at: p.startedAt || null,
            ended_at: p.endedAt || null,
            description: p.description || null,
          })),
        )
        .execute();
    }

    if (resume.education.length > 0) {
      await trx
        .insertInto("member_education")
        .values(
          resume.education.map((e) => ({
            did,
            institution: e.institution,
            degree: e.degree,
            field: e.field || null,
            started_at: e.startedAt || null,
            ended_at: e.endedAt || null,
            description: e.description || null,
          })),
        )
        .execute();
    }

    if (resume.projects.length > 0) {
      await trx
        .insertInto("member_projects")
        .values(
          resume.projects.map((p) => ({
            did,
            name: p.name,
            description: p.description || null,
            url: p.url || null,
            started_at: p.startedAt || null,
            ended_at: p.endedAt || null,
          })),
        )
        .execute();
    }

    if (resume.skills.length > 0) {
      await trx
        .insertInto("member_skills")
        .values(
          resume.skills.map((skill) => ({
            did,
            skill: skill.trim().toLowerCase(),
          })),
        )
        .execute();
    }

    if (resume.languages.length > 0) {
      await trx
        .insertInto("member_languages")
        .values(
          resume.languages.map((language) => ({
            did,
            language: language.trim().toLowerCase(),
          })),
        )
        .execute();
    }

    if (resume.preferredWorkplace.length > 0) {
      await trx
        .insertInto("member_preferred_workplaces")
        .values(
          resume.preferredWorkplace.map((workplace_type) => ({
            did,
            workplace_type,
          })),
        )
        .execute();
    }

    if (resume.profile.profiles && resume.profile.profiles.length > 0) {
      await trx
        .insertInto("member_profiles")
        .values(
          resume.profile.profiles.map((profile) => ({
            did,
            url: normalizeUrl(profile.url),
          })),
        )
        .execute();
    }
  });

  // Refresh the profile query to reflect changes
  getMemberProfile({ handle: event.locals.handle }).refresh();
});
