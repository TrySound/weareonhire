import * as v from "valibot";
import {
  type Resume as JsonResume,
  ISO8601Schema,
  EmploymentTypeSchema,
  WorkplaceTypeSchema,
  ProfileSchema as JsonResumeProfileSchema
} from "./jsonresume";

export const ProfileSchema = v.object({
  name: v.string(),
  email: v.optional(v.string()),
  profiles: v.optional(v.array(JsonResumeProfileSchema)),
  website: v.optional(v.string()),
  location: v.optional(v.string()),
  headline: v.optional(v.string()),
  summary: v.optional(v.string()),
  industry: v.optional(v.string()),
});

export type Profile = v.InferOutput<typeof ProfileSchema>;

export const PositionSchema = v.object({
  company: v.string(),
  title: v.string(),
  location: v.optional(v.string()),
  workplaceType: v.optional(WorkplaceTypeSchema),
  employmentType: v.optional(EmploymentTypeSchema),
  description: v.optional(v.string()),
  startedAt: v.optional(ISO8601Schema),
  endedAt: v.optional(ISO8601Schema),
});

export type Position = v.InferOutput<typeof PositionSchema>;

export const EducationSchema = v.object({
  institution: v.string(),
  degree: v.string(),
  field: v.optional(v.string()),
  description: v.optional(v.string()),
  startedAt: v.optional(ISO8601Schema),
  endedAt: v.optional(ISO8601Schema),
});

export type Education = v.InferOutput<typeof EducationSchema>;

export const ProjectSchema = v.object({
  name: v.string(),
  description: v.optional(v.string()),
  url: v.optional(v.string()),
  startedAt: v.optional(ISO8601Schema),
  endedAt: v.optional(ISO8601Schema),
});

export type Project = v.InferOutput<typeof ProjectSchema>;

export const ResumeSchema = v.object({
  profile: ProfileSchema,
  positions: v.array(PositionSchema),
  education: v.array(EducationSchema),
  projects: v.array(ProjectSchema),
  preferredWorkplace: v.array(WorkplaceTypeSchema),
  skills: v.array(v.string()),
  languages: v.array(v.string()),
});

export type Resume = v.InferOutput<typeof ResumeSchema>;


// Converter: JSON Resume → Internal Format
export function toInternalResume(jsonResume: JsonResume): Resume {
  return {
    profile: {
      name: jsonResume.basics?.name ?? "",
      email: jsonResume.basics?.email,
      website: jsonResume.basics?.url,
      location: jsonResume.basics?.location?.address,
      headline: jsonResume.basics?.label,
      summary: jsonResume.basics?.summary,
      industry: jsonResume.extension?.industry,
      profiles: jsonResume.basics?.profiles,
    },
    positions: (jsonResume.work ?? []).map((w) => ({
      company: w.name ?? "",
      title: w.position ?? "",
      location: w.location,
      workplaceType: w.extension?.workplaceType,
      employmentType: w.extension?.employmentType,
      description: w.summary,
      startedAt: w.startDate,
      endedAt: w.endDate,
    })),
    education: (jsonResume.education ?? []).map((e) => ({
      institution: e.institution ?? "",
      degree: e.studyType ?? "",
      field: e.area,
      description: e.extension?.description,
      startedAt: e.startDate,
      endedAt: e.endDate,
    })),
    projects: (jsonResume.projects ?? []).map((p) => ({
      name: p.name ?? "",
      description: p.description,
      url: p.url,
      startedAt: p.startDate,
      endedAt: p.endDate,
    })),
    preferredWorkplace: jsonResume.extension?.preferredWorkplaces ?? [],
    skills: (jsonResume.skills ?? []).map((s) => s.name ?? "").filter(Boolean),
    languages: (jsonResume.languages ?? [])
      .map((l) => l.language ?? "")
      .filter(Boolean),
  };
}

// Converter: Internal Format → JSON Resume
export function fromInternalResume(internal: Resume): JsonResume {
  return {
    $schema:
      "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: internal.profile.name || undefined,
      label: internal.profile.headline,
      email: internal.profile.email,
      url: internal.profile.website,
      summary: internal.profile.summary,
      location: internal.profile.location
        ? { address: internal.profile.location }
        : undefined,
      profiles: internal.profile.profiles,
    },
    work: internal.positions.map((p) => ({
      name: p.company,
      position: p.title,
      location: p.location,
      startDate: p.startedAt,
      endDate: p.endedAt,
      summary: p.description,
      extension:
        p.employmentType || p.workplaceType
          ? {
              employmentType: p.employmentType,
              workplaceType: p.workplaceType,
            }
          : undefined,
    })),
    education: internal.education.map((e) => ({
      institution: e.institution,
      studyType: e.degree,
      area: e.field,
      startDate: e.startedAt,
      endDate: e.endedAt,
      extension: e.description
        ? {
            description: e.description,
          }
        : undefined,
    })),
    projects: internal.projects.map((p) => ({
      name: p.name,
      description: p.description,
      url: p.url,
      startDate: p.startedAt,
      endDate: p.endedAt,
    })),
    skills: internal.skills.map((s) => ({ name: s })),
    languages: internal.languages.map((l) => ({ language: l })),
    extension: {
      industry: internal.profile.industry,
      preferredWorkplaces: internal.preferredWorkplace,
    },
    meta: {
      lastModified: new Date().toISOString(),
    },
  };
}
