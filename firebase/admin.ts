// firebase/admin.ts

import admin from "firebase-admin";

// आपकी .env.local फ़ाइल में दिए गए वेरिएबल्स
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Private key को ठीक करता है
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth(); // auth को यहाँ एक्सपोर्ट करें

export { db, auth }; // db और auth दोनों को एक्सपोर्ट करें