// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBOiwIkkFyrWhemD6cGl3A85Hvlz16NU5o",
  authDomain: "tccflow-94be6.firebaseapp.com",
  projectId: "tccflow-94be6",
  storageBucket: "tccflow-94be6.firebasestorage.app",
  messagingSenderId: "207188280509",
  appId: "1:207188280509:web:34dc672554887295c3e3d4",
  measurementId: "G-VR3R2TD099"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
