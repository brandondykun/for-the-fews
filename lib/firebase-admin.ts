import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
};

// Initialize Firebase Admin (only once)
const app =
  getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    // Always log auth errors, even in production, since they're critical
    console.error("Error verifying ID token:", error);
    throw new Error("Invalid token");
  }
}
