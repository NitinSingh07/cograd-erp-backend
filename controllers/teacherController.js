const bcrypt = require("bcryptjs");
const Teacher = require("../models/teacherModel");
const Subject = require("../models/subjectModel");
const { setTeacher, getTeacher } = require("../service/teacherAuth");
const { getSchool } = require("../service/schoolAuth");

// Teacher Registration
const teacherRegister = async (req, res) => {
  try {
    const token = req.cookies?.token; // Retrieve the JWT token from the cookies
    const decodedToken = getSchool(token); // Decode the token to extract school information

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, email, password, teachSubjects } = req.body;

    if (!name || !email || !password || !teachSubjects) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new Teacher({
      name,
      email,
      school: decodedToken.id, // Use the school ID from the decoded token
      teachSubjects,
      password: hashedPassword,
    });

    let savedTeacher = await teacher.save();

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

    // Removing sensitive data from the response
    savedTeacher.password = undefined;
    return res.status(201).json(savedTeacher);
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Teacher Login
const teacherLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }
    console.log("right ");
    const token = setTeacher(teacher);
    res.cookie("teacherToken", token);
    console.log(token);
    teacher.password = undefined;
    return res.status(200).json(teacher);
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// const getteacherList = async (req, res) => {
//   try {
//     const token = req.cookies?.token; // Retrieve the JWT token from the cookies
//     const decodedToken = getSchool(token); // Decode the token to extract school information
//     console.log(decodedToken);
//     if (!decodedToken || !decodedToken.id) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const schoolId = decodedToken.id; // Extract the school ID from the decoded token

//     const teacherList = await Teacher.find({
//       school: schoolId,
//     }).select("-password");

//     const totalTeachers = teacherList.length; // Get the total count of students

//     if (totalTeachers > 0) {
//       res.status(200).json({
//         totalTeachers, // Include the total student count in the response
//         teacherList, // Send the student list
//       });
//     } else {
//       res.status(404).json({ message: "No Teachers  found" });
//     }
//   } catch (err) {
//     res.status(500).json({ message: "Internal server error", error: err });
//   }
// };

const addTimeline = async (req, res) => {
  const { startTime, endTime, subjectId, classId } = req.body;
  try {
    // const token = req.cookies?.token;
    // const decodedToken = getTeacher(token);

    // if (!decodedToken || !decodedToken.id) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }

    const teacherId = req.params.id;

    // const teacherId = decodedToken.id;

    const teacher = await Teacher.findById(teacherId);
    const subject = await Subject.findById(subjectId);

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    teacher.timeline.push({
      startTime,
      endTime,
      subject: subjectId,
      class: classId,
    });

    await teacher.save();

    res.status(200).json({ message: "Timeline updated successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

const fetchTeacherTimeline = async (req, res) => {
  const teacherId = req.params.id;

  try {
    const teacher = await Teacher.findById(teacherId).populate({
      path: "timeline",
      populate: { path: "class subject" }, // Populate the 'class' and 'subject' fields in the timeline entries
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const timeline = teacher.timeline;

    res.status(200).json({ timeline });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  teacherRegister,
  teacherLogin,
  addTimeline,
  fetchTeacherTimeline,
};
