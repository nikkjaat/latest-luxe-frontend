// services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrZ-cYVCqJMfd3U9VFkLBnEItSijHXBoE",
  authDomain: "luxe-app-nikhil.firebaseapp.com",
  projectId: "luxe-app-nikhil",
  storageBucket: "luxe-app-nikhil.firebasestorage.app",
  messagingSenderId: "402610146497",
  appId: "1:402610146497:web:3a95c8cb6ed95674ce5840",
  measurementId: "G-H36CGCJXHC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Analytics (optional)
const analytics = getAnalytics(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Optional: Add custom parameters
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Optional: Add scopes
googleProvider.addScope("email");
googleProvider.addScope("profile");

// Export everything explicitly
export { auth, googleProvider, analytics };
export default app;
