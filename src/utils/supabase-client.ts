import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseJwt } from "../lib/actions";

export const createSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
      accessToken: async () => await getSupabaseJwt() || "" 
    }
  );
};

// For server-side usage
export const createSupabaseServerClient = async () => {
  const { createServerClient } = await import("@supabase/ssr");
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    }
  );
};
