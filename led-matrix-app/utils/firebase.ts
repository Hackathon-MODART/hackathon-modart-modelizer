import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Initialize Firebase with lazy evaluation to ensure useRuntimeConfig is called within Nuxt context
export const useFirebase = () => {
  const config = useRuntimeConfig();

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
    measurementId: config.public.firebaseMeasurementId
  };

  // Prevent multiple initializations in dev mode
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  let analytics;
  if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
  }

  const db = getFirestore(app);

  return { app, db, analytics };
};