import admin from "firebase-admin";
import serviceAccount from '@/lib/firebaseAdmin.js'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
export default admin;