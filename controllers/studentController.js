const bcrypt = require("bcrypt");
const StudentModel = require("../models/studentSchema.js"); // Rename import to avoid conflict
const { setStudent } = require("../service/studentAuth.js");
const getDataUri = require("../utils/dataUri.js");
const ComplaintBox = require("../models/complaintBox.js");
const examResultModel = require("../models/examResultModel.js");
const studentAttendanceModel = require("../models/studentAttendanceModel.js");
const parentModel = require("../models/parentModel.js");
const cloudinary = require("cloudinary").v2;

const studentRegister = async (req, res) => {
  const {
    name,
    email,
    password,
    className,
    fathersName,
    fatherEmail,
    schoolId,
    dob
  } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    //Done using multer
    const file = req.file;
    console.log(file);

    if (!file) {
      return res.status(400).json({ message: "Photo is required" });
    }

    const photoUri = getDataUri(file);

    const myCloud = await cloudinary.uploader.upload(photoUri.content);

    const student = new StudentModel({
      name,
      email,
      password: hashedPass,
      profile: myCloud.secure_url,
      className,
      schoolName: schoolId, // corrected from 'school'
      fathersName,
      fatherEmail,
      dob
    });

    const existingStudentByEmail = await StudentModel.findOne({ email });
    // const existingSchool = await StudentModel.findOne({ schoolName });

    // Validate email domain
    const emailDomain = email.split("@")[1];
    const validDomain = emailDomain === "cograd.in";

    if (existingStudentByEmail) {
      res.status(401).send({ message: "Email already exists" });
    } else if (!validDomain) {
      res.status(401).send({
        message: "Email domain is not valid. It should be @cograd.in",
      });
    } else {
      let result = await student.save();
      result.password = undefined;
      const response = await (
        await result.populate("className", "className")
      ).populate("schoolName", "schoolName");
      res.status(200).json(response);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
const studentEditDetails = async (req, res) => {
  const {
    id,
    name,
    email,
    password,
    className,
    fathersName,
    fatherEmail,
    dob
    // Remove schoolId from here
  } = req.body;

  try {
    // Check if the student exists
    const existingStudent = await StudentModel.findById(id);

    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Handle password update if provided
    let hashedPass = existingStudent.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPass = await bcrypt.hash(password, salt);
    }

    // Handle photo update using multer
    let profileUrl = existingStudent.profile;
    const file = req.file;
    if (file) {
      const photoUri = getDataUri(file);
      const myCloud = await cloudinary.uploader.upload(photoUri.content);
      profileUrl = myCloud.secure_url;
    }

    // Update student details
    existingStudent.name = name;
    existingStudent.dob = dob;
    existingStudent.email = email;
    existingStudent.password = hashedPass;
    existingStudent.className = className;
    // Do not update schoolId unless provided in req.body
    if (req.body.schoolId) {
      existingStudent.schoolName = req.body.schoolId;
    }

    existingStudent.fathersName = fathersName;
    existingStudent.fatherEmail = fatherEmail;
    existingStudent.profile = profileUrl;

    // Save updated student
    const updatedStudent = await existingStudent.save();
    updatedStudent.password = undefined; // Remove password from response

    // Populate related fields
    // await updatedStudent.populate("className", "className").execPopulate();
    // await updatedStudent.populate("schoolName", "schoolName").execPopulate();

    // Send response
    res.status(200).json(updatedStudent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
const studentLogIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const student = await StudentModel.findOne({ email })
      .populate("className", "className")
      .populate("schoolName", "schoolName");
    if (student) {
      const passwordMatch = await bcrypt.compare(password, student.password);
      if (passwordMatch) {
        student.password = undefined;

        const studentToken = setStudent(student);
        res.cookie("studentToken", studentToken);
        res.status(200).json(student);
      } else {
        res.status(401).send({ message: "Invalid password" });
      }
    } else {
      res.status(401).send({ message: "Student   not found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getStudentDetail = async (req, res) => {
  try {
    let student = await StudentModel.findById(req.params.id);
    if (student) {
      student.password = undefined;
      student = await (
        await student.populate("className", "className")
      ).populate("schoolName", "schoolName");
      res.status(200).json(student);
    } else {
      res.status(404).send({ message: "No student found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    let student = await StudentModel.findById(studentId);


    if (!student) {
      return res.status(404).json({ message: "No student found" });
    }

    await ComplaintBox.deleteMany({ studentId: studentId });

    await examResultModel.findOneAndDelete({ student: studentId });

    await studentAttendanceModel.deleteMany({ student: studentId });

    const parent = await parentModel.findOne({
      "students.studentId": studentId,
    });

    if (parent && parent.students.length === 1) {
      await parentModel.findByIdAndDelete(parent._id);
    } else if (parent && parent.students.length > 1) {
      // Remove the student from the students array
      const studentToRemove = parent.students.find(
        (student) => student.studentId.toString() === studentId
      );

      const totalFees =
        studentToRemove.fees.admission +
        studentToRemove.fees.tuition +
        studentToRemove.fees.exams +
        studentToRemove.fees.maintenance +
        studentToRemove.fees.others;

      parent.students = parent.students.filter(
        (student) => student.studentId.toString() !== studentId
      );

      // Update payments data accordingly
      parent.payments.forEach((payment) => {
        payment.remainingAmount -= totalFees;
      });

      await parent.save();
    }

    await StudentModel.findByIdAndDelete(student._id);

    res.status(200).json({ message: "Student deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server error" });
  }
};

const studentList = async (req, res) => {
  try {
    const studentList = await StudentModel.find({
      className: req.params.id,
    }).select("-password");

    if (studentList.length > 0) {
      res.send(studentList);
    } else {
      res.status(404).send({ message: "No student found" });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

const schoolStudentList = async (req, res) => {
  try {
    const schoolId = req.params.id;
    if (!schoolId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const studentList = await StudentModel.find({
      schoolName: schoolId,
    })
      .populate("className")
      .select("-password");

    if (studentList.length > 0) {
      res.status(200).json(studentList);
    } else {
      res.status(404).json({ message: "No students found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
};

module.exports = {
  studentList,
  studentRegister,
  studentLogIn,
  getStudentDetail,
  schoolStudentList,
  deleteStudent,
  studentEditDetails
};
