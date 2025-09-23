import { getApp, getApps, initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import type { FirebaseStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";

// Firebase configuration object type
type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

// Debug logging for environment variables
const debugFirebaseConfig = () => {
  const config: FirebaseConfig = {
    apiKey: "AIzaSyBXJlvUKyxfb-aG6a8QLrbYCoauUlGt-_8",
    authDomain: "gitgudmanager-4d8c0.firebaseapp.com",
    projectId: "gitgudmanager-4d8c0",
    storageBucket: "gitgudmanager-4d8c0.firebasestorage.app",
    messagingSenderId: "552655469668",
    appId: "1:552655469668:web:ee832671eba0e66df5f371",
    measurementId: "G-28F37RS6R5"
  };

  console.log('=== Firebase Config Debug ===');
  console.log(JSON.stringify(config, null, 2));
  return config;
};

// Your web app's Firebase configuration
const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyBXJlvUKyxfb-aG6a8QLrbYCoauUlGt-_8",
  authDomain: "gitgudmanager-4d8c0.firebaseapp.com",
  projectId: "gitgudmanager-4d8c0",
  storageBucket: "gitgudmanager-4d8c0.firebasestorage.app",
  messagingSenderId: "552655469668",
  appId: "1:552655469668:web:ee832671eba0e66df5f371",
  measurementId: "G-28F37RS6R5"
};

// Debug log in development
debugFirebaseConfig();

// Validate required config
const validateConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'] as const;
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof FirebaseConfig]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required Firebase configuration fields: ${missingFields.join(', ')}`);
  }
  
  // Validate API key format
  if (!firebaseConfig.apiKey || !firebaseConfig.apiKey.startsWith('AIza')) {
    throw new Error('Invalid Firebase API key format');
  }
  
  // Validate app ID format (should match with messaging sender ID)
  const appIdParts = firebaseConfig.appId.split(':');
  if (appIdParts.length !== 4 || appIdParts[1] !== firebaseConfig.messagingSenderId) {
    console.warn('Firebase App ID might be mismatched with Messaging Sender ID');
  }
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required Firebase configuration: ${missing.join(', ')}`);
  }
};

// Firebase instances
let app;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

// Initialize Firebase and its services
const initializeFirebase = () => {
  try {
    // Get the configuration
    const firebaseConfig = debugFirebaseConfig();

    // Initialize Firebase
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    console.log('Firebase initialized successfully');

    // Initialize services (only in browser)
    if (typeof window !== 'undefined') {
      // Initialize Storage
      storage = getStorage(app);
      console.log('Firebase Storage initialized');

      // Initialize Analytics if measurement ID is available
      if (process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized');
      }
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

// Initialize everything
initializeFirebase();

export type UploadProgressCallback = (progress: number) => void;

export async function uploadFile(file: File, setProgress?: UploadProgressCallback): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, `meetings/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          
          if (setProgress) {
            setProgress(progress);
          }

          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          console.error("Upload error:", error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    } catch (error) {
      console.error("Upload error:", error);
      reject(error);
    }
  });
}

export { storage, analytics };
