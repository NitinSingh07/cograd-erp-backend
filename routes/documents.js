const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Document = require('../models/documentSchema');
const cloudinary = require("cloudinary").v2;
const getDataUri = require("../utils/dataUri");

// POST /documents/upload
router.post('/upload', upload, async (req, res) => {
    try {
        const { teacherId } = req.body; // Extract teacherId from request body

        // Check if teacherId is provided
        if (!teacherId) {
            return res.status(400).json({ message: "Teacher ID is required." });
        }

        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded." });
        }

        // Prepare documents array to save in database
        const documents = [];

        // Iterate through uploaded files and upload to Cloudinary
        for (const file of files) {
            const photoUri = getDataUri(file);

            // Upload file to Cloudinary
            const myCloud = await cloudinary.uploader.upload(photoUri.content);

            // Create document object with Cloudinary URL and teacherId
            const document = new Document({
                name: file.originalname,
                url: myCloud.secure_url,
                teacher: teacherId // Associate all documents with the same teacherId
            });
            documents.push(document);
        }

        // Save documents in database
        const savedDocuments = await Document.insertMany(documents);

        return res.status(200).json(savedDocuments);
    } catch (error) {
        console.error("Error during document upload:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

module.exports = router;
