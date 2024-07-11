const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const cloudinary = require("cloudinary").v2;
const getDataUri = require("../utils/dataUri");
const Student = require('../models/studentSchema');

// POST /documents/upload
router.post('/', upload, async (req, res) => {
    try {
        const { studentId } = req.body; // Extract studentId from request body

        // Check if studentId is provided
        if (!studentId) {
            return res.status(400).json({ message: "Student ID is required." });
        }

        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded." });
        }

        // Find the student by ID
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
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

            // Add document to student's documents array
            student.documents.push(document);
        }

        // Save the updated student document
        await student.save();

        return res.status(200).json(student.documents);
    } catch (error) {
        console.error("Error during document upload:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
// PUT /documents/edit
router.put('/edit', upload, async (req, res) => {
    try {
        const { studentId, documents } = req.body; // Extract studentId and documents from request body

        // Check if studentId is provided
        if (!studentId) {
            return res.status(400).json({ message: "Student ID is required." });
        }

        // Find the student by ID
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        // Clear existing documents if new documents are provided
        if (documents && documents.length > 0) {
            student.documents = [];
            for (const doc of documents) {
                const existingDoc = {
                    name: doc.name,
                    url: doc.url,
                };
                student.documents.push(existingDoc);
            }
        }

        // Check if new files are uploaded
        const files = req.files;
        if (files && files.length > 0) {
            for (const file of files) {
                const photoUri = getDataUri(file);

                // Upload file to Cloudinary
                const myCloud = await cloudinary.uploader.upload(photoUri.content);

                // Create document object with Cloudinary URL
                const document = {
                    name: file.originalname,
                    url: myCloud.secure_url,
                };

                // Add document to student's documents array
                student.documents.push(document);
            }
        }

        // Save the updated student document
        await student.save();

        return res.status(200).json(student.documents);
    } catch (error) {
        console.error("Error during document edit:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});
module.exports = router;
