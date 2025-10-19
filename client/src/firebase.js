// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";  
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqp7iHxDor8MEbw77rG7Rf7KB1-LX1WJc",
  authDomain: "st-pilates.firebaseapp.com",
  projectId: "st-pilates",
  storageBucket: "st-pilates.firebasestorage.app",
  messagingSenderId: "519912895059",
  appId: "1:519912895059:web:e246e36343f6dfb553cca6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);