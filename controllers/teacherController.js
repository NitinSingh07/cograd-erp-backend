const bcrypt = require("bcryptjs");
const Teacher = require("../models/teacherModel");
const Subject = require("../models/subjectModel");
const TeacherOtpModel = require("../models/teacherOtpModel");
const { setTeacher, getTeacher } = require("../service/teacherAuth");
const getDataUri = require("../utils/dataUri");
const {
  InteractionPage,
} = require("twilio/lib/rest/proxy/v1/service/session/interaction");
const { sendSMS } = require("../utils/sendSMS");
const LoginTrackModel = require("../models/LoginTrackModel");
const cloudinary = require("cloudinary").v2;

const TeacherAttendance = require("../models/teacherAttendanceModel");

const moment = require("moment");
const geolib = require("geolib");
const momentTZ = require("moment-timezone");

const schoolList = [
  {
    SCHOOL_ID: "669d3a9a7a956fd4c7e286c0",
    SCHOOL:
      "Suresh International college, Nagla Himmat, Kathua, Uttar Pradesh 206253",
    SCHOOL_LATITUDE: 26.975703192161742,
    SCHOOL_LONGITUDE: 79.0591269259595,
  },
  {
    SCHOOL_ID: "669d42a07a956fd4c7e28934",
    SCHOOL:
      "Shri H. N. Public School, Ngla Sikarwar, Ghiror, Mainpuri, Uttar Pradesh 205121",
    SCHOOL_LATITUDE: 27.19708688316965,
    SCHOOL_LONGITUDE: 78.79602232031293,
  },
];

const SCHOOL_RADIUS = 20; // 20 meters
const START_TIME = "08:00";
const END_TIME = "15:00";

// Teacher Registration

const teacherRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      teachSubjects,
      schoolId,
      salary,
      computerKnowledge,
      computerTyping,
      contact,
      qualification,
      skills,
      dob,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !salary ||
      !teachSubjects ||
      !computerKnowledge ||
      !computerTyping ||
      !contact ||
      !qualification ||
      !skills ||
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
      dob,
      school: schoolId,
      teachSubjects: parsedTeachSubjects,
      password: hashedPassword,
      profile: myCloud.secure_url,
      salary,
      computerKnowledge,
      computerTyping,
      contact,
      qualification,
      skills,
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

// Teacher Login Through Phone number
const teacherAppLogin = async (req, res) => {
  const { phoneNumber, deviceToken } = req.body;

  try {
    // Find teacher by phone number
    const teacher = await Teacher.findOne({ contact: phoneNumber });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }


    // // Generate token (assuming setTeacher function creates a token)
    // const token = setTeacher(teacher);

    // // Set token as a cookie
    // res.cookie("teacherToken", token);

    // // Remove password from the response
    // teacher.password = undefined;

    if (deviceToken) {
      teacher.deviceToken = deviceToken;
      await teacher.save();
    }

    // Return teacher data
    return res.status(200).json(teacher);
  } catch (error) {
    console.error("Error logging in teacher:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// tracking the login and attendace of teacher according to location and time
const loginTrackTeacherApp = async (req, res) => {
  const { teacherId, selfie, latitude, longitude, loginTime } = req.body;

  // Check if the login time is within the allowed range
  const TIMEZONE = "Asia/Kolkata";

  const loginMoment = momentTZ.tz(loginTime, "HH:mm", TIMEZONE); // Parse loginTime in IST
  const startMoment = momentTZ.tz(START_TIME, "HH:mm", TIMEZONE); // Start time in IST
  const endMoment = momentTZ.tz(END_TIME, "HH:mm", TIMEZONE); 

  const teacher = await Teacher.findOne({
    _id: teacherId,
  });

  const teacherSchool = schoolList.find(
    (school) => teacher.school.toString() === school.SCHOOL_ID
  );

  // Check if the location is within the school radius
  const isWithinRadius = geolib.isPointWithinRadius(
    { latitude, longitude },
    {
      latitude: teacherSchool.SCHOOL_LATITUDE,
      longitude: teacherSchool.SCHOOL_LONGITUDE,
    },
    SCHOOL_RADIUS
  );

  const inSchool =
    isWithinRadius && loginMoment.isBetween(startMoment, endMoment);

  if (inSchool) {
    // Mark teacher attendance for that day
    await TeacherAttendance.insertOne({
      teacher: teacher._id,
      date: new Date(),
      status: "p",
      school: teacherSchool.SCHOOL_ID,
    });
  }

  const newLoginTrack = new LoginTrackModel({
    teacherId,
    selfie,
    latitude,
    longitude,
    loginTime,
    inSchool,
  });

  try {
    const savedLoginTrack = await newLoginTrack.save();
    res.status(201).json(savedLoginTrack);
  } catch (error) {
    res.status(500).json({ message: "Error saving login track data", error });
  }
};
// tracking the logout of teacher according to location and time
const logoutTrackTeacherApp = async (req, res) => {
  const { teacherId, logoutTime, latitude, longitude } = req.body;

  try {
    const logoutMoment = moment(logoutTime, "HH:mm");
    const startMoment = moment(START_TIME, "HH:mm");
    const endMoment = moment(END_TIME, "HH:mm");

    const teacher = await Teacher.findOne({ _id: teacherId });
    const teacherSchool = schoolList.find(
      (school) => teacher.school.toString() === school.SCHOOL_ID
    );

    // Check if the logout time is within the allowed range
    const isWithinLogoutTime = logoutMoment.isBetween(
      startMoment,
      endMoment,
      null,
      "[]"
    );

    // Check if the location is within the school radius at logout
    const isWithinRadius = geolib.isPointWithinRadius(
      { latitude, longitude },
      {
        latitude: teacherSchool.SCHOOL_LATITUDE,
        longitude: teacherSchool.SCHOOL_LONGITUDE,
      },
      SCHOOL_RADIUS
    );

    const inSchoolAtLogout = isWithinLogoutTime && isWithinRadius;

    // Find the latest active login track
    const loginTrack = await LoginTrackModel.findOne({
      teacherId: teacherId,
      logoutTime: null,
    }).sort({ loginTime: -1 });
     
    if (loginTrack) {
      loginTrack.logoutTime = logoutTime;
      loginTrack.logoutLatitude = latitude;
      loginTrack.logoutLongitude = longitude;
      loginTrack.inSchoolAtLogout = inSchoolAtLogout;

      await loginTrack.save();
      res.status(200).json(loginTrack);
    } else {
      res
        .status(404)
        .json({ message: "No active login found for this teacher." });
    }

  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating logout track data", error });
  }
};

// Get login track data by teacher ID and date
const getLoginTrackByTeacherAndDate = async (req, res) => {
  const { teacherId, date } = req.body;
  try {
    const loginTracks = await LoginTrackModel.find({
      teacherId,
      loginTime: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
      },
    });

    if (!loginTracks.length) {
      return res
        .status(404)
        .json({
          message:
            "No login track data found for the specified teacher and date",
        });
    }

    res.status(200).json(loginTracks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching login track data", error });
  }
};

const editTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const {
      name,
      email,
      password,
      teachSubjects,
      salary,
      computerKnowledge,
      computerTyping,
      contact,
      qualification,
      skills,
      dob,
    } = req.body;

    console.log(req.body);

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    // Update basic information
    if (name) teacher.name = name;
    if (dob) teacher.dob = dob;
    if (email) teacher.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      teacher.password = hashedPassword;
    }
    if (computerKnowledge) teacher.computerKnowledge = computerKnowledge;
    if (computerTyping) teacher.computerTyping = computerTyping;
    if (contact) teacher.contact = contact;
    if (salary) teacher.salary = salary;
    if (qualification) teacher.qualification = qualification;

    // Parse teachSubjects
    const parsedTeachSubjects =
      typeof teachSubjects === "string"
        ? JSON.parse(teachSubjects)
        : teachSubjects;
    console.log(parsedTeachSubjects);
    // Unassign the teacher from all old subjects
    // if (parsedTeachSubjects) {
    //   await Promise.all(
    //     teacher.teachSubjects.map(async (subjectId) => {
    //       const subject = await Subject.findById(subjectId);
    //       if (subject && subject.teacher.toString() === teacher._id.toString()) {
    //         subject.teacher = null;
    //         await subject.save();
    //       }
    //     })
    //   );
    // }

    // Update profile picture if a new file is uploaded
    if (req.file) {
      const file = req.file;
      const photoUri = getDataUri(file);
      const myCloud = await cloudinary.uploader.upload(photoUri.content);
      teacher.profile = myCloud.secure_url;
    }

    // Clear the current teachSubjects array
    teacher.teachSubjects = [];

    // Assign the teacher to the new subjects
    if (parsedTeachSubjects) {
      await Promise.all(
        parsedTeachSubjects.map(async (subjectId) => {
          const subject = await Subject.findById(subjectId);
          if (subject) {
            subject.teacher = teacher._id;
            await subject.save();
            teacher.teachSubjects.push(subjectId);
          }
        })
      );
    }

    const updatedTeacher = await teacher.save();
    updatedTeacher.password = undefined; // Remove password from the response

    return res.status(200).json(updatedTeacher);
  } catch (error) {
    console.error("Error during teacher update:", error);
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
  editTeacher,
  teacherAppLogin,
  loginTrackTeacherApp,
  logoutTrackTeacherApp,
  getLoginTrackByTeacherAndDate,
};
