const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const cloudinary = require("cloudinary").v2;
const getDataUri = require("../utils/dataUri");
const Teacher = require('../models/teacherModel');

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

        // Find the teacher by ID
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found." });
        }

        // Iterate through uploaded files and upload to Cloudinary
        for (const file of files) {
            const photoUri = getDataUri(file);

            // Upload file to Cloudinary
            const myCloud = await cloudinary.uploader.upload(photoUri.content);

            // Create document object with Cloudinary URL
            const document = {
                name: file.originalname,
                url: myCloud.secure_url,
            };

            // Add document to teacher's documents array
            teacher.documents.push(document);
        }

        // Save the updated teacher document
        await teacher.save();

        return res.status(200).json(teacher.documents);
    } catch (error) {
        console.error("Error during document upload:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

module.exports = router;
