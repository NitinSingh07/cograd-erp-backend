const bcrypt = require("bcryptjs");
const Teacher = require("../models/teacherModel");
const Subject = require("../models/subjectModel");
const { setTeacher, getTeacher } = require("../service/teacherAuth");
const getDataUri = require("../utils/dataUri");
const {
  InteractionPage,
} = require("twilio/lib/rest/proxy/v1/service/session/interaction");
const cloudinary = require("cloudinary").v2;
// Teacher Registration

const teacherRegister = async (req, res) => {
  try {
    const { name, email, password, teachSubjects, schoolId ,salary } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !salary||
      !teachSubjects ||
      !teachSubjects.length
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Parse teachSubjects if it's not already an array
    const parsedTeachSubjects =
      typeof teachSubjects === "string"
        ? JSON.parse(teachSubjects)
        : teachSubjects;

    // const subjects = await Subject.find({ _id: { $in: parsedTeachSubjects } });
    // for (const subject of subjects) {
    //   if (subject.teacher) {
    //     return res.status(400).json({
    //       message: `Subject ${subject.name} is already assigned to a teacher.`,
    //     });
    //   }
    // }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Done using multer
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Profile Photo is required" });
    }

    const photoUri = getDataUri(file);

    const myCloud = await cloudinary.uploader.upload(photoUri.content);
    const teacher = new Teacher({
      name,
      email,
      school: schoolId,
      teachSubjects: parsedTeachSubjects,
      password: hashedPassword,
      profile: myCloud.secure_url,
      salary
    });

    let savedTeacher = await teacher.save();

    // Assign teacher's ID to the subjects and save them concurrently
    await Promise.all(
      parsedTeachSubjects.map(async (subjectId) => {
        const subject = await Subject.findById(subjectId);
        if (subject) {
          subject.teacher = savedTeacher._id;
          await subject.save();
        }
      })
    );

    // Removing sensitive data from the response
    savedTeacher.password = undefined;
    return res.status(200).json(savedTeacher);
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
    const token = setTeacher(teacher);
    res.cookie("teacherToken", token);
    teacher.password = undefined;
    return res.status(200).json(teacher);
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getAllTeacherList = async (req, res) => {
  try {
    // const token = req.cookies?.adminToken; // Retrieve the JWT token from the cookies
    const admin = req.params.adminId;

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const teacherList = await Teacher.find().select("-password");

    const totalTeachers = teacherList.length; // Get the total count of students

    if (totalTeachers > 0) {
      res.status(200).json({
        totalTeachers, // Include the total student count in the response
        teacherList, // Send the student list
      });
    } else {
      res.status(404).json({ message: "No Teachers  found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
};

const getTeacherById = async (req, res) => {
  try {
    // const token = req.cookies?.teacherToken; // Retrieve the JWT token from the cookies
    // const decodedToken = getTeacher(token); // Decode the token to extract school information
    // if (!decodedToken) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }
    // const teacherId = decodedToken.id
    const teacherId = req.params.id;

    const teacher = await Teacher.findById(teacherId)
      .select("-password")
      .populate("school")
      .populate("teachSubjects");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.status(200).json(teacher);
  } catch (err) {
    if (err.message === "Invalid token") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.error("Error retrieving teacher:", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
};
const addTimeline = async (req, res) => {
  const { startTime, endTime, subject } = req.body;
  try {
    // const token = req.cookies?.token;
    // const decodedToken = getTeacher(token);

    // if (!decodedToken || !decodedToken.id) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }

    const teacherId = req.params.id;
    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // const teacherId = decodedToken.id;

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    teacher.timeline.push({
      startTime,
      endTime,
      subject,
    });

    await teacher.save();

    res.status(200).json({ message: "Timeline updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const fetchTeacherTimeline = async (req, res) => {
  const teacherId = req.params.id;

  try {
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const timeline = teacher.timeline;

    res.status(200).json(timeline);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const editTeacherTimeline = async (req, res) => {
  try {
    const { timelineId, startTime, endTime, subject } = req.body;

    const teacherId = req.params.id;
    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // const teacherId = decodedToken.id;

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const timeline = teacher.timeline.id(timelineId);

    if (!timeline) {
      return res.status(404).json({ message: "Timeline not found" });
    }

    // Update the timeline properties
    timeline.startTime = startTime;
    timeline.endTime = endTime;
    timeline.subject = subject;

    // Save the teacher document to persist changes
    await teacher.save();

    res.status(200).json({ message: "Timeline updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteTeacherTimeline = async (req, res) => {
  try {
    const { timelineId, teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const timeline = teacher.timeline.id(timelineId);

    if (!timeline) {
      return res.status(404).json({ message: "Timeline not found" });
    }

    // Remove the timeline entry from the array
    teacher.timeline.pull(timelineId);

    // Save the updated teacher document
    await teacher.save();

    // Send a success response
    res.status(200).json({ message: "Timeline entry deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  teacherRegister,
  teacherLogin,
  addTimeline,
  fetchTeacherTimeline,
  getAllTeacherList,
  getTeacherById,
  deleteTeacherTimeline,
  editTeacherTimeline,
};
