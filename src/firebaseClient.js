import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCyb126_Edbh4A77jqQV9k0oWqgD_RQPjg",
  authDomain: "gujju-backend.firebaseapp.com",
  projectId: "gujju-backend",
  storageBucket: "gujju-backend.firebasestorage.app",
  messagingSenderId: "737012205142",
  appId: "1:737012205142:web:a65d06f4ec283d38655df7",
  measurementId: "G-8CHEH90J53"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
