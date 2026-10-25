// Public Firebase settings for the sign-in screen (these are safe to share;
// secret keys stay on the server). Returns firebase: null until Firebase is set up.
import { NextResponse } from "next/server";

export async function GET() {
  const cfg = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const ready = Boolean(cfg.apiKey && cfg.projectId && cfg.apiKey !== "your_firebase_api_key");
  return NextResponse.json({ firebase: ready ? cfg : null });
}
