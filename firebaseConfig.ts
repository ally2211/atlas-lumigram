// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2WrpPEYcxZgOTf7yvUYkN6lldd_8rqVg",
  authDomain: "lumigram-cee46.firebaseapp.com",
  projectId: "lumigram-cee46",
  storageBucket: "lumigram-cee46.firebasestorage.app",
  messagingSenderId: "686058935896",
  appId: "1:686058935896:web:b19450cd4a04bc926a9c2d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
