import * as admin from "firebase-admin";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (privateKey) {
  // Replace escaped \n with real newlines
  privateKey = privateKey.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  try {
    if (projectId && clientEmail && privateKey && privateKey.includes("BEGIN PRIVATE KEY")) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
      console.log("Firebase Admin successfully initialized with service account.");
    } else if (process.env.FIREBASE_ADMIN_CREDENTIALS) {
      // Support service-account.json or raw JSON credentials as fallback
      let parsedCreds;
      try {
        parsedCreds = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
      } catch {
        parsedCreds = undefined;
      }

      if (parsedCreds) {
        admin.initializeApp({
          credential: admin.credential.cert(parsedCreds),
          projectId: parsedCreds.project_id || projectId,
        });
      } else {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId,
        });
      }
    } else if (projectId) {
      admin.initializeApp({
        projectId,
      });
    }
  } catch (error) {
    console.warn("Firebase Admin initialization warning:", error);
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;

/**
 * Verifies the Firebase ID token from the Authorization header.
 * Used strictly in server-side API routes.
 */
export async function verifyAuthToken(authHeader: string | null): Promise<string> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const token = authHeader.substring(7).trim();

  // Demo tokens only work while Firebase isn't set up (local testing).
  // Once Firebase is configured, they're refused, so nobody can read
  // another person's notes by guessing a demo token.
  if (token.startsWith("demo-token-")) {
    if (adminAuth) throw new Error("Unauthorized: demo sign-in is off once Firebase is set up");
    return "demo-" + token.slice("demo-token-".length).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  }

  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      return decoded.uid;
    } catch (err) {
      console.error("Error verifying Firebase ID token:", err);
      throw new Error("Unauthorized: Invalid ID token");
    }
  }

  // Fallback for development if Admin SDK not yet configured
  if (process.env.NODE_ENV !== "production") {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
        if (payload.user_id || payload.sub) {
          return payload.user_id || payload.sub;
        }
      }
    } catch {
      // ignore
    }
    return "demo-user-123";
  }

  throw new Error("Firebase Admin is not configured. Please supply FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.");
}

export default admin;
