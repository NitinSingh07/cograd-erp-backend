// routes/staffRoutes.js
const express = require('express');
const router = express.Router();
const { addStaffMember, getStaffDetails } = require('../controllers/staffController');
const { restrictTo } = require('../middleware/auth');

// Route to add a new staff member
router.post('/', addStaffMember);
router.get('/:schoolId' , getStaffDetails)

module.exports = router;
