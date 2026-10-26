// Public Supabase configuration for client sign-in and vault storage.
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
  const ready = Boolean(supabase.url && supabase.anonKey);
  return NextResponse.json({
    supabase: ready ? supabase : null,
    firebase: null,
  });
}
