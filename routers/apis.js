const express = require('express');
const { sendResponse } = require('../utils/response.js');
const { db } = require('../src/firebaseClient.js');
const { collection, doc, setDoc, getDocs, updateDoc } = require('firebase/firestore');

const router = express.Router();

const idData = 'priyesh-bhautik';
const collectionName = 'apis';

router.post('/add/:id', async (req, res) => {
    const { id } = req.params;
    const { apis } = req.body;
    // const { name, endPoint, payload, method, } = req.body;
    if (id == idData) {

        try {

            const addedDocs = [];

            for (const api of apis) {

                const apiDocRef = doc(collection(db, collectionName));
                await setDoc(apiDocRef, api);

                addedDocs.push({
                    docId: apiDocRef.id,
                    ...api
                });
            }

            return sendResponse(res, `${addedDocs[0]?.name.charAt(0).toUpperCase() + addedDocs[0]?.name.slice(1)} APIs added successfully`, true, addedDocs);

        } catch (error) {
            return sendResponse(res, 'Failed to add user', false, { error: error.message });
        }

    }
})

router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    try {

        const updates = {
            ...req.body
        };

        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, updates);
        return sendResponse(res, 'API Update SuccessFully', true, req.body);
    } catch (error) {
        console.log(error)
        return sendResponse(res, 'true', false, error);
    }
})

router.get('/list/:id', async (req, res) => {
    const { id } = req.params;
    const url = `${req.protocol}://${req.get('host')}`
    if (id == idData) {

        const apiCollectionRef = collection(db, collectionName);
        const snapshot = await getDocs(apiCollectionRef);

        const groupedApis = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            const { name, endPoint, payload, method } = data;

            // Convert payload to array if it's a comma-separated string
            const formattedPayload = typeof payload === 'string'
                ? payload.split(',').map(item => item.trim())
                : Array.isArray(payload) ? payload : [];

            if (!groupedApis[name]) {
                groupedApis[name] = [];
            }

            groupedApis[name].push({
                endPoint,
                payload: formattedPayload,
                method
            });
        });
        const responseData = {
            url,
            groupedApis
        }
        return sendResponse(res, 'Fetched APIs', true, responseData);
    } else {
        return sendResponse(res, 'User Not Found', true);
    }
})

module.exports = router;