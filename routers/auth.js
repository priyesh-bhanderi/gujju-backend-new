import express from 'express';
import { db } from '../src/firebaseClient.js';
import { sendResponse } from '../utils/response.js';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const router = express.Router();

// 🔐 Signup Route
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return sendResponse(res, 'Email and password are required', false);
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return sendResponse(res, 'Email already exists', false);
    }

    const newUser = {
      email,
      password, // ⚠️ Plaintext! Use bcrypt in real apps
      createdAt: new Date()
    };

    const docRef = await addDoc(usersRef, newUser);

    return sendResponse(res, 'User added successfully', true, {
      docId: docRef.id,
      ...newUser
    });

  } catch (error) {
    console.error('Signup error:', error);
    return sendResponse(res, error.message, false);
  }
});

// 🔑 Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return sendResponse(res, 'Email and password are required', false);
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return sendResponse(res, 'Invalid email or password', false);
    }

    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data();

    if (user.password !== password) {
      return sendResponse(res, 'Invalid email or password', false);
    }

    return sendResponse(res, 'Login successful', true, {
      docId: userDoc.id,
      email: user.email,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error('Login error:', error);
    return sendResponse(res, error.message, false);
  }
});

export default router;
