const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
const { sendResponse } = require('../utils/response.js');


// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage (no writing to disk)
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload-image
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
           return sendResponse(res, false, 'No image uploaded',)
        }

        const streamUpload = (reqFileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'project_uploads' },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(reqFileBuffer).pipe(stream);
            });
        };

        const result = await streamUpload(req.file.buffer);

        return sendResponse(res, true, 'Image uploaded successfully', result.secure_url);
    } catch (error) {
        console.log(error)
        return sendResponse(res, false, error.message);
    }
});

module.exports = router;
