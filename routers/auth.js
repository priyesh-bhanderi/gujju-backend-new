import express from 'express';
import { db } from '../src/firebaseClient.js';
import { sendResponse } from '../utils/response.js';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

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
      password, // ⚠️ still plaintext – hash this in real apps
      createdAt: new Date()
    };

    const docRef = await addDoc(usersRef, newUser);

    const token = jwt.sign({ id: docRef.id, email }, JWT_SECRET, { expiresIn: '7d' });

    return sendResponse(res, 'User added successfully', true, {
      id: docRef.id,
      email,
      token
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

    const token = jwt.sign({ id: userDoc.id, email }, JWT_SECRET, { expiresIn: '7d' });

    return sendResponse(res, 'Login successful', true, {
      id: userDoc.id,
      email: user.email,
      // role:'admin',
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return sendResponse(res, error.message, false);
  }
});

router.get('/profile', async (req, res) => {
  console.log(JWT_SECRET)
  return sendResponse(res, 'Profile fetched', true);
});

export default router;
