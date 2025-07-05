import express from 'express';
import { db } from '../src/firebaseClient.js';
import { sendResponse } from '../utils/response.js';

import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return sendResponse(res, 'Email and password are required', false);
    }

    // 🔍 Check if email already exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Email already exists
      return sendResponse(res, 'Email already exists', false);
    }

    // ✅ Email does not exist — add new user
    const newUser = {
      email,
      password,
      createdAt: new Date()
    };

    const docRef = await addDoc(usersRef, newUser);

    return sendResponse(res, 'User added successfully', true, {
      docId: docRef.id,
      ...newUser
    });

  } catch (error) {
    return sendResponse(res, error.message, false);
  }
});

export default router;
