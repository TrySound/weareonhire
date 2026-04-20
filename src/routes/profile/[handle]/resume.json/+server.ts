import { json, error } from "@sveltejs/kit";
import { loadResume } from "$lib/resume.server";
import { loadSifaResume } from "$lib/sifa.server";
import type { RequestHandler } from "./$types";
import { handleResolver } from "$lib/auth";

export const GET: RequestHandler = async ({ params }) => {
  const handle = params.handle;
  if (!handle) {
    error(400, "Missing handle parameter");
  }
  const did = await handleResolver.resolve(handle);
  if (!did) {
    error(404);
  }
  const resume = (await loadResume(did)) ?? (await loadSifaResume(did, false));
  if (!resume) {
    error(404, "Profile not found");
  }
  return json(resume, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
