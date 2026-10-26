// Server-side Supabase client for Thought Dump.
// Uses the service_role key to manage users, vault_files table, and vault_audio storage bucket.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseServer = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export const usingSupabase = () => Boolean(supabaseServer);

/**
 * Verifies the Supabase JWT access token from the Authorization header.
 * Returns the authenticated user's ID (UUID string).
 */
export async function verifyAuthToken(authHeader: string | null): Promise<string> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const token = authHeader.substring(7).trim();

  // Demo tokens for local offline testing before Supabase is configured
  if (token.startsWith("demo-token-")) {
    if (supabaseServer) {
      throw new Error("Unauthorized: demo sign-in is disabled once Supabase is configured");
    }
    return "demo-" + token.slice("demo-token-".length).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  }

  if (supabaseServer) {
    try {
      const { data: { user }, error } = await supabaseServer.auth.getUser(token);
      if (error || !user) {
        throw error || new Error("User not found for token");
      }
      return user.id;
    } catch (err) {
      console.error("Error verifying Supabase token:", err);
      throw new Error("Unauthorized: Invalid session token");
    }
  }

  // Fallback in local development without Supabase keys
  return "demo-user-123";
}
