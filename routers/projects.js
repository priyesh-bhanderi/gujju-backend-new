import express from 'express';
import multer from 'multer';
import { sendResponse } from '../utils/response.js';
import { db } from '../src/firebaseClient.js';
import path from 'path';
import fs from 'fs/promises';

import { collection, addDoc, getDocs, orderBy, query, updateDoc, doc, getDoc } from 'firebase/firestore';
import { deleteDocWithImage } from '../utils/deleteDocWithImage.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const collectionName = 'projects';

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
router.post('/add', verifyToken, upload.single('image'), async (req, res) => {
    const { title, category, description, tools, link, status } = req.body;
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
            category,
            description,
            tools,
            link,
            status,
            createdAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, collectionName), newCtg);
        const docId = docRef.id;

        // 2. Rename image file to docId
        const newFileName = `${docId}${ext}`;
        const newFilePath = path.join('assets', newFileName);

        await fs.rename(tempPath, newFilePath);

        // 3. Update Firestore document with new image name
        await updateDoc(docRef, { image: newFileName });

        return sendResponse(res, 'Project added', true, {
            id: docId,
            ...newCtg,
            image: newFileName,
        });
    } catch (e) {
        return sendResponse(res, e.message, false);
    }
});

router.post('/update/:id', verifyToken, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, category, description, tools, link, } = req.body;
    const file = req.file;

    try {
        const docRef = doc(db, collectionName, id);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
            return sendResponse(res, false, 'Document not found');
        }

        const existingData = snapshot.data();
        const updates = {
            title,
            category,
            description,
            tools,
            link,
        };

        if (file) {
            // Remove old image
            if (existingData.image) {
                const oldImagePath = path.join('assets', existingData.image);
                try {
                    await fs.unlink(oldImagePath);
                } catch (err) {
                    console.warn('Old image not found or already deleted');
                }
            }

            // Rename new image to doc ID
            const ext = path.extname(file.originalname);
            const newFileName = `${id}${ext}`;
            const newFilePath = path.join('assets', newFileName);

            await fs.rename(file.path, newFilePath);
            updates.image = newFileName;
        }

        await updateDoc(docRef, updates);

        return sendResponse(res, 'Project updated successfully', true, {
            id,
            ...existingData,
            ...updates,
            image: updates.image || existingData.image,
            imageUrl: `${req.protocol}://${req.get('host')}/assets/${updates.image || existingData.image}`,
        });
    } catch (e) {
        console.error('Error updating category:', e);
        return sendResponse(res, e.message, false);
    }
});

// GET /list
router.get('/list', verifyToken, async (req, res) => {
    try {
        const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const projects = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                imageUrl: `${req.protocol}://${req.get('host')}/assets/${data.image}`
            };
        });
        if (snapshot.docs.length > 0) {
            return sendResponse(res, 'Projects fetched successfully', true, projects);
        } else {
            return sendResponse(res, 'Projects Not Available', true, projects);
        }

    } catch (e) {
        return sendResponse(res, e.message, false);
    }
});

router.delete('/delete/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const result = await deleteDocWithImage(collectionName, id);
    return sendResponse(res, result.message, result.status);

});

router.post('/update-status/:id', async (req, res) => {
    const { id } = req.params;
    try {

        const updates = {
            ...req.body
        };

        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, updates);
        return sendResponse(res, 'api', true, req.body);
    } catch (error) {
        console.log(error)
        return sendResponse(res, 'true', false, error);
    }
})


export default router;
