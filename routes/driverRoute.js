// routes/driverRoutes.js
const express = require('express');
const router = express.Router();
const { addDriver, getDrivers } = require('../controllers/driverController');


// Route to add a new driver
router.post('/add', addDriver);

// Route to get all drivers for a school
router.get('/get/:id', getDrivers);

module.exports = router;
