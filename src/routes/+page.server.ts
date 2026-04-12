import { getDB } from "$lib/db";
import { searchActorsWithSifaProfiles } from "$lib/search.remote";

export const load = async ({ locals, url }) => {
  const db = await getDB();
  const result = await db
    .selectFrom("members")
    .select(({ fn }) => [fn.count("did").as("count")])
    .executeTakeFirst();

  const query = url.searchParams.get("q") || "";
  let searchResults = null;

  if (query.trim()) {
    searchResults = await searchActorsWithSifaProfiles({ q: query });
  }

  return {
    handle: locals.handle,
    role: locals.role,
    memberCount: Number(result?.count || 0),
    query,
    searchResults,
  };
};
