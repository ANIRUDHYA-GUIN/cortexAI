// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cotexai-3c602.firebaseapp.com",
  projectId: "cotexai-3c602",
  storageBucket: "cotexai-3c602.firebasestorage.app",
  messagingSenderId: "965083335028",
  appId: "1:965083335028:web:ee0fc10484b4915ea00421"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)
export const googleProvider=new GoogleAuthProvider()