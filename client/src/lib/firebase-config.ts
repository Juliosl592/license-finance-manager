import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyArW5yBMgBS920Q8nNkxk9hk1wnhoqSL6Y",
   authDomain: "calculadora-financiera-d8282.firebaseapp.com",
   projectId: "calculadora-financiera-d8282",
   storageBucket: "calculadora-financiera-d8282.firebasestorage.app",
   messagingSenderId: "177168332596",
   appId: "1:177168332596:web:4ebf8b34a97822b5d61761",
   measurementId: "G-F5GNLWHXLS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };