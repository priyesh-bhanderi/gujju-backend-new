import express from 'express';
import multer from 'multer';
import { sendResponse } from '../utils/response.js';
import { db } from '../src/firebaseClient.js';
import path from 'path';
import fs from 'fs/promises';

import { collection, addDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { deleteDocWithImage } from '../utils/deleteDocWithImage.js';

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
        const ext = path.extname(file.originalname); // Keep original file extension
        const tempPath = file.path;

        // 1. Create document with temporary image name
        const newCtg = {
            image: file.filename, // temporary name for now
            title,
            description,
            tech,
            url,
            createdAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, 'categories'), newCtg);
        const docId = docRef.id;

        // 2. Rename image file to docId
        const newFileName = `${docId}${ext}`;
        const newFilePath = path.join('assets', newFileName);

        await fs.rename(tempPath, newFilePath);

        // 3. Update Firestore document with new image name
        await updateDoc(docRef, { image: newFileName });

        return sendResponse(res, 'Category added', true, {
            id: docId,
            ...newCtg,
            image: newFileName,
        });
    } catch (e) {
        return sendResponse(res, e.message, false);
    }
});

// GET /list
router.get('/list', async (req, res) => {
    try {
        const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        if (snapshot.docs.length > 0) {
            const categories = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    imageUrl: `${req.protocol}://${req.get('host')}/assets/${data.image}`
                };
            });
            return sendResponse(res, 'Categories fetched successfully', true, categories);
        } else {
            return sendResponse(res, 'Categories Not Available', true, categories);
        }

    } catch (e) {
        console.error('Error fetching categories:', e);
        return sendResponse(res, e.message, false);
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    const result = await deleteDocWithImage('categories', id);
    return sendResponse(res, result.message, result.status);

});

export default router;
