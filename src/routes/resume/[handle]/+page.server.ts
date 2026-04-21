import type { HandleString } from "@atproto/lex";

export const load = async ({ params, locals }) => {
  const profileHandle = params.handle as HandleString;

  return {
    handle: locals.handle,
    profile: {
      handle: profileHandle,
    },
  };
};
