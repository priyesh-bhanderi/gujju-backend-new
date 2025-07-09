const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');

const { sendResponse } = require('../utils/response.js');
const { db } = require('../src/firebaseClient.js');
const { collection, addDoc, getDocs, orderBy, query, updateDoc, doc, getDoc } = require('firebase/firestore');
const { deleteDocWithImage } = require('../utils/deleteDocWithImage.js');
const { verifyToken } = require('../middleware/authMiddleware.js');

const router = express.Router();
const collectionName = 'projects';

// POST /add (with image upload)
router.post('/add', verifyToken, async (req, res) => {
    const { title, category, description, tools, link, status, image } = req.body;

    if (!image) {
        return sendResponse(res, false, 'Image file is required');
    }

    try {

        const newCtg = {
            image,
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

        return sendResponse(res, 'Project added', true, {
            id: docId,
            ...newCtg,
        });
    } catch (e) {
        console.log(e)
        return sendResponse(res, e.message, false);
    }
});

router.post('/update/:id', verifyToken, async (req, res) => {

    const { id } = req.params;
    const { title, category, description, tools, link, image } = req.body;

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
            image
        };

        await updateDoc(docRef, updates);

        return sendResponse(res, 'Project updated successfully', true, {
            id,
            ...existingData,
            ...updates,
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

router.delete('/delete/:id',
    verifyToken, async (req, res) => {
        const { id } = req.params;
        const result = await deleteDocWithImage(collectionName, id);
        return sendResponse(res, result.message, result.status);

    });

router.post('/update-status/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {

        const updates = {
            ...req.body
        };

        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, updates);
        return sendResponse(res, 'Status Update Successfully', true, req.body);
    } catch (error) {
        console.log(error)
        return sendResponse(res, 'true', false, error);
    }
})


module.exports = router;
