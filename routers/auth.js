const express = require("express");
const { db } = require('../src/firebaseClient.js');
const { sendResponse } = require('../utils/response.js');
const { collection, query, where, getDocs, addDoc } = require('firebase/firestore');
const { verifyToken } = require('../middleware/authMiddleware.js');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET_KEY;
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

    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET is missing in environment variables.');
      process.exit(1); // stop server if it's critical
    }

    const token = jwt.sign({ id: userDoc.id, email }, JWT_SECRET, { expiresIn: '7d' });

    return sendResponse(res, 'Login successful', true, {
      id: userDoc.id,
      email: user.email,
      role:'admin',
      token
    });

  } catch (error) {
    return sendResponse(res, error.message, false);
  }
});

router.get('/profile', verifyToken, async (req, res) => {
  console.log(JWT_SECRET)
  return sendResponse(res, 'Profile fetched', true);
});

module.exports = router;
