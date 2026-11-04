import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase helpers for when DATA_PROVIDER=supabase. Not used by the default
 * mock provider. See docs/ARCHITECTURE.md → "Switching to Supabase".
 */

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}. See .env.example.`);
  return v;
}

/** Per-request client acting as the signed-in user (RLS applies). */
export async function createSupabaseServerClient() {
  const jar = await cookies();
  return createServerClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) jar.set(name, value, options);
        } catch {
          // Called from a Server Component — cookies are refreshed by the proxy instead.
        }
      },
    },
  });
}

/** Service-role client for trusted server tasks (payment webhooks, admin jobs). Never expose to the browser. */
export function createSupabaseAdminClient() {
  return createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
