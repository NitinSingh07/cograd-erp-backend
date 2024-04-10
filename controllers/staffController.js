// controllers/staffController.js
const Staff = require('../models/staffModel');
const { getSchool } = require('../service/schoolAuth');

const addStaffMember = async (req, res) => {
  try {
    const token = req.cookies?.token; // Retrieve the JWT token from the cookies
    const decodedToken = getSchool(token); // Decode the token to extract school information

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, salary, post } = req.body; // Assuming school ID is not passed in the request body

    const staffMember = new Staff({
      school: decodedToken.id, // Use the school ID from the decoded token
      name,
      salary,
      post
    });

    const savedStaffMember = await staffMember.save();
    res.status(201).json(savedStaffMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStaffDetails = async (req, res) => {
  try {
    const token = req.cookies?.token; // Retrieve the JWT token from the cookies
    const decodedToken = getSchool(token); // Decode the token to extract school information

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const schoolId = decodedToken.id; // Extract the school ID from the decoded token

    const staffMember = await Staff.find({ school: schoolId });
    res.json(staffMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  addStaffMember,
  getStaffDetails
};
