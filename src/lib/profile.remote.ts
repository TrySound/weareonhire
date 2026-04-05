import * as v from "valibot";
import { error } from "@sveltejs/kit";
import { query, getRequestEvent } from "$app/server";
import { getDB } from "./db";
import type { Resume, EmploymentType, WorkplaceType } from "./resume-schema";

export const getMemberProfile = query(
  v.object({ handle: v.string() }),
  async ({ handle }) => {
    const event = getRequestEvent();
    if (!event.locals.did) {
      error(401);
    }

    const db = await getDB();

    // Get target member
    const targetMember = await db
      .selectFrom("members")
      .selectAll()
      .where("handle", "=", handle)
      .executeTakeFirst();
    if (!targetMember) {
      error(404, "Member not found");
    }

    // Load all related data
    const [positions, education, projects, skills, languages, workplaces] =
      await Promise.all([
        db
          .selectFrom("member_positions")
          .selectAll()
          .where("did", "=", targetMember.did)
          .execute(),
        db
          .selectFrom("member_education")
          .selectAll()
          .where("did", "=", targetMember.did)
          .execute(),
        db
          .selectFrom("member_projects")
          .selectAll()
          .where("did", "=", targetMember.did)
          .execute(),
        db
          .selectFrom("member_skills")
          .select("skill")
          .where("did", "=", targetMember.did)
          .execute(),
        db
          .selectFrom("member_languages")
          .select("language")
          .where("did", "=", targetMember.did)
          .execute(),
        db
          .selectFrom("member_preferred_workplaces")
          .select("workplace_type")
          .where("did", "=", targetMember.did)
          .execute(),
      ]);

    const profile: Resume = {
      profile: {
        name: targetMember.name ?? "",
        email: targetMember.email ?? undefined,
        location: targetMember.location ?? undefined,
        headline: targetMember.headline ?? undefined,
        summary: targetMember.summary ?? undefined,
        industry: targetMember.industry ?? undefined,
        linkedin: targetMember.linkedin ?? undefined,
        github: targetMember.github ?? undefined,
        website: targetMember.website ?? undefined,
      },
      positions: positions.map((p) => ({
        company: p.company,
        title: p.title,
        location: p.location ?? undefined,
        workplaceType: (p.workplace_type ?? undefined) as
          | WorkplaceType
          | undefined,
        employmentType: (p.employment_type ?? undefined) as
          | EmploymentType
          | undefined,
        description: p.description ?? undefined,
        startedAt: p.started_at ?? undefined,
        endedAt: p.ended_at ?? undefined,
      })),
      education: education.map((e) => ({
        institution: e.institution,
        degree: e.degree,
        field: e.field ?? undefined,
        description: e.description ?? undefined,
        startedAt: e.started_at ?? undefined,
        endedAt: e.ended_at ?? undefined,
      })),
      projects: projects.map((p) => ({
        name: p.name,
        description: p.description ?? undefined,
        url: p.url ?? undefined,
        startedAt: p.started_at ?? undefined,
        endedAt: p.ended_at ?? undefined,
      })),
      preferredWorkplace: workplaces.map(
        (w) => w.workplace_type as WorkplaceType,
      ),
      skills: skills.map((s) => s.skill),
      languages: languages.map((l) => l.language),
    };

    return profile;
  },
);
