import * as v from "valibot";
import { type Resume, ResumeSchema } from "./resume-schema";

// Create empty resume helper
function createEmptyResume(): Resume {
  return {
    profile: {
      name: "",
    },
    positions: [],
    education: [],
    projects: [],
    preferredWorkplace: [],
    skills: [],
    languages: [],
  };
}

const STORAGE_KEY = "weareonhire-cv";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function saveToStorage(resume: Resume): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
  } catch {
    console.error("Failed to save resume to localStorage");
  }
}

export function loadFromStorage(): Resume {
  if (!isBrowser()) return createEmptyResume();
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Validate using valibot schema
      const result = v.safeParse(ResumeSchema, parsed);
      if (result.success) {
        return result.output;
      }
      console.warn("Stored resume data is invalid, returning empty resume");
    }
  } catch {
    console.error("Failed to load resume from localStorage");
  }
  return createEmptyResume();
}
