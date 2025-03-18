import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDqjYkl6-qrRx9ybCGGI11udAlKeGcrHwI",
    authDomain: "resumeanalyzer-bd3d5.firebaseapp.com",
    projectId: "resumeanalyzer-bd3d5",
    storageBucket: "resumeanalyzer-bd3d5.firebasestorage.app",
    messagingSenderId: "965611656080",
    appId: "1:965611656080:web:eb02b929bce99a5085d915",
    measurementId: "G-T9HGL86CPP"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
