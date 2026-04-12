import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBW2HGnAg4bfxsu0s3D_Zh0WdUNmTXtKBI",
  authDomain: "obituary-management-system.firebaseapp.com",
  projectId: "obituary-management-system",
  storageBucket: "obituary-management-system.firebasestorage.app",
  messagingSenderId: "5807760058",
  appId: "1:5807760058:web:1add160f2d323d3f761883"
};

// Prevent duplicate app initialization in Next.js dev mode
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
export default app;
