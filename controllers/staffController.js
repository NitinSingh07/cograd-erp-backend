// controllers/staffController.js
const Staff = require('../models/staffModel');
const { getSchool } = require('../service/schoolAuth');

const addStaffMember = async (req, res) => {
  try {


    const { name, salary, post , id } = req.body; // Assuming school ID is not passed in the request body

    const staffMember = new Staff({
      school: id, // Use the school ID from the decoded token
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
    const schoolId = req.params.id;
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
