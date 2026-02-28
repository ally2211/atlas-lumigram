// firebaseConfig.ts
import { Platform } from "react-native";
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

function initAuth() {
  if (Platform.OS === "web") {
    return getAuth(app);
  }
  const { getReactNativePersistence } = require("@firebase/auth");
  return initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export const auth = initAuth();
export const storage = getStorage(app);
export const db = getFirestore(app);
export const storageBucket = firebaseConfig.storageBucket;
