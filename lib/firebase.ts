import Constants from 'expo-constants';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';

type FirebaseExtra = {
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as FirebaseExtra;

const firebaseConfig = {
  // Fallback to hardcoded values so app does not crash when expo extra is unavailable at runtime.
  apiKey: extra.firebaseApiKey || 'AIzaSyBKFCF9iPUtesTw66kcptMN6DBqM2rGWYo',
  authDomain: extra.firebaseAuthDomain || 'clamor-exercise7-be409.firebaseapp.com',
  projectId: extra.firebaseProjectId || 'clamor-exercise7-be409',
  storageBucket: extra.firebaseStorageBucket || 'clamor-exercise7-be409.firebasestorage.app',
  messagingSenderId: extra.firebaseMessagingSenderId || '121499381204',
  appId: extra.firebaseAppId || '1:121499381204:web:05eed90293b893d1033a41',
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

export { auth };
