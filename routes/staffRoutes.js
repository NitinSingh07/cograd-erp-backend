// routes/staffRoutes.js
const express = require('express');
const router = express.Router();
const { addStaffMember, getStaffDetails } = require('../controllers/staffController');
const { restrictTo } = require('../middleware/auth');

// Route to add a new staff member
router.post('/add', addStaffMember);
router.get('/get' , getStaffDetails)

module.exports = router;
