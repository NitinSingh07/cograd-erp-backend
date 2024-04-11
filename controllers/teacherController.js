const bcrypt = require("bcrypt");
const Teacher = require("../models/teacherModel");
const Subject = require("../models/subjectModel");

const teacherRegister = async (req, res) => {
  const { name, email, password, role, school, teachSubjects } =
    req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const teacher = new Teacher({
      name,
      email,
      password: hashedPass,
      role,
      school,
      teachSubjects,
      salary,
    });

    const existingTeacherByEmail = await Teacher.findOne({ email });

    if (existingTeacherByEmail) {
      res.send({ message: "Email already exists" });
    } else {
      let result = await teacher.save();
      // Iterate over teachSubjects array
      for (const subjectInfo of teachSubjects) {
        const { subject } = subjectInfo;

        // Find the subject by its ID
        const subjectFind = await Subject.findById(subject);

        if (!subjectFind) {
          return res.status(404).json({ message: "Subject not found" });
        }

        // Assign teacher's ID to the subject
        subjectFind.teacher = teacher._id;
        // Save the updated subject
        await subjectFind.save();
      }

      result.password = undefined;
      const response = await result.populate("school", "schoolName");
      res.send(response);
    }
  } catch (err) {
    res.status(500).json(err);
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