// controllers/driverController.js
const Driver = require('../models/driverModel');
const { getSchool } = require('../service/schoolAuth');

const addDriver = async (req, res) => {
  try {

    const { name, busNumber, pickUpPoints, contactNumber ,id } = req.body;

    const newDriver = new Driver({
      school: id, // Use the school ID from the decoded token
      name,
      busNumber,
      pickUpPoints,
      contactNumber,
    });

    const savedDriver = await newDriver.save();
    res.status(201).json({
      message: "Driver added successfully",
      driver: savedDriver,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDrivers = async (req, res) => {
  try {
    const schoolId = req.params.id; // Extract the school ID from the decoded token
    const drivers = await Driver.find({ school: schoolId });

    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addDriver,
  getDrivers,
};
