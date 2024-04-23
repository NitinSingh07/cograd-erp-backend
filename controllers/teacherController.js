const bcrypt = require("bcrypt");
const Teacher = require("../models/teacherModel");
const Subject = require("../models/subjectModel");
const { getSchool } = require("../service/schoolAuth");

// Improved teacher registration function
const teacherRegister = async (req, res) => {
  const { name, email, password, school, teachSubjects } = req.body;

  try {
    // Validate inputs
    if (!name || !email || !password || !school || !teachSubjects) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check for existing teacher by email
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    // Create a new teacher instance
    const teacher = new Teacher({
      name,
      email,
      password: hashedPass,
      school,
      teachSubjects,
    });

    // Save the teacher to the database
    const savedTeacher = await teacher.save();

    // Update subjects with the teacher ID
    for (const subjectInfo of teachSubjects) {
      const { subject } = subjectInfo;

      // Check if the subject exists
      const subjectFind = await Subject.findById(subject);
      if (!subjectFind) {
        return res.status(404).json({ message: "Subject not found." });
      }

      // Assign teacher to the subject
      subjectFind.teacher = savedTeacher._id;
      await subjectFind.save();
    }

    // Remove the password from the response
    savedTeacher.password = undefined;
    const response = await savedTeacher.populate("school", "schoolName");

    // Respond with the created teacher data
    return res.status(201).json(response);
  } catch (err) {
    console.error("Error during teacher registration:", err.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
const getTeachersBySchool = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const teachers = await Teacher.find({ school: schoolId }).populate("teachSubjects.subject", "subjectName").select("-password");
    
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getTeachersBySchool, teacherRegister
}