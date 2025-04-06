import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkNeFz-K3swZzmsBSxDAtBKDVlXU8LehE",
  authDomain: "lovelink-dating-app.firebaseapp.com",
  projectId: "lovelink-dating-app",
  storageBucket: "lovelink-dating-app.appspot.com",
  messagingSenderId: "435620606699",
  appId: "1:435620606699:web:6897e7693557a10cde44ae",
  measurementId: "G-RCJN329QW6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
