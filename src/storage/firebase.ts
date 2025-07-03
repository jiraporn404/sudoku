// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtFKdiOrvJgElOyfqttD9ef1CyoG-8h3A",
  authDomain: "sudoku-b03d2.firebaseapp.com",
  databaseURL: "https://sudoku-b03d2-default-rtdb.firebaseio.com",
  projectId: "sudoku-b03d2",
  storageBucket: "sudoku-b03d2.firebasestorage.app",
  messagingSenderId: "423149871061",
  appId: "1:423149871061:web:bf375323258166d9ca275c",
  measurementId: "G-JHT709XY8G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const dbRealTime = getDatabase(app);

export { dbRealTime };
