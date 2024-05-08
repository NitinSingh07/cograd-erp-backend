// controllers/driverController.js
const Driver = require('../models/driverModel');
const { getSchool } = require('../service/schoolAuth');

const addDriver = async (req, res) => {
  try {
    const token = req.cookies?.token; // Retrieve the JWT token from cookies
    const decodedToken = getSchool(token); // Decode the token to extract school information

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, busNumber, pickUpPoints, contactNumber } = req.body;

    const newDriver = new Driver({
      school: decodedToken.id, // Use the school ID from the decoded token
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
    const token = req.cookies?.token; // Retrieve the JWT token from cookies
    const decodedToken = getSchool(token); // Decode the token to extract school information

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const schoolId = decodedToken.id; // Extract the school ID from the decoded token
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
