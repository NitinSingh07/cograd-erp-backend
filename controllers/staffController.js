// controllers/staffController.js
const Staff = require('../models/staffModel');

const addStaffMember = async (req, res) => {
  try {
    const { school, name, salary, post } = req.body;

    const staffMember = new Staff({
      school,
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
    const { schoolId } = req.params;

    const staffMember = await Staff.find({ school: schoolId })
    res.json(staffMember)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  addStaffMember,
  getStaffDetails
};
