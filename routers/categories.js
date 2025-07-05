import express from 'express';
import multer from 'multer';
import { sendResponse } from '../utils/response.js';
import { db } from '../src/firebaseClient.js';

import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore';

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/');
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

// POST /add (with image upload)
router.post('/add', upload.single('image'), async (req, res) => {
    const { title, description, tech, url } = req.body;
    const file = req.file;

    if (!file) {
        return sendResponse(res, false, 'Image file is required');
    }

    try {
        const newCtg = {
            image: file.filename,
            title,
            description,
            tech,
            url,
            createdAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, 'categories'), newCtg);

        return sendResponse(res, 'Category added', true, {
            docId: docRef.id,
            ...newCtg,
        });
    } catch (e) {
        console.error('Error adding category:', e);
        return sendResponse(res, e.message, false);
    }
});

// GET /list
router.get('/list', async (req, res) => {
    try {
        const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const categories = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                imageUrl: `${req.protocol}://${req.get('host')}/assets/${data.image}`
            };
        });

        return sendResponse(res, 'Categories fetched successfully', true, {
            categories
        });
    } catch (e) {
        console.error('Error fetching categories:', e);
        return sendResponse(res, e.message, false);
    }
});

export default router;
