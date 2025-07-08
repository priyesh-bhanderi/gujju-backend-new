const { doc, deleteDoc, getDoc } = require('firebase/firestore');
const { db } = require('../src/firebaseClient.js');
const fs = require('fs/promises');
const path = require('path');

const deleteDocWithImage = async (collectionName, docId) => {
  try {
    // Step 1: Get document data
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { status: false, message: 'Data not found' };
    }

    const data = docSnap.data();
    const imageName = data.image;

    // Step 2: Delete image file if it exists
    if (imageName) {
      const imagePath = path.join('assets', imageName);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.warn(`Image file not found or already deleted: ${imageName}`);
      }
    }

    // Step 3: Delete the Firestore document
    await deleteDoc(docRef);

    return { status: true, message: 'Document and image deleted successfully' };
  } catch (err) {
    console.error('Error in deleteDocWithImage:', err);
    return { status: false, message: err.message };
  }
};

module.exports = { deleteDocWithImage };
