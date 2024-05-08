const bcrypt = require("bcrypt");
const StudentModel = require("../models/studentSchema.js"); // Rename import to avoid conflict
const { setStudent } = require("../service/studentAuth.js");
const { getSchool } = require("../service/schoolAuth.js");
const getDataUri = require("../utils/dataUri.js");
const cloudinary = require("cloudinary").v2;

const studentRegister = async (req, res) => {
  const { name, email, password, className, fathersName, fatherEmail } =
    req.body;
  const token = req.cookies?.token; // Retrieve the JWT token from the cookies
  const decodedToken = getSchool(token); // Decode the token to extract school information
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
      schoolName: decodedToken.id, // corrected from 'school'
      fathersName,
      fatherEmail,
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
      res.status(401).send({ message: "User not found" });
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
      res.send(student);
    } else {
      res.status(404).send({ message: "No student found" });
    }
  } catch (err) {
    res.status(500).json(err);
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
    const token = req.cookies?.token; // Retrieve the JWT token from the cookies
    const decodedToken = getSchool(token); // Decode the token to extract school information
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const schoolId = decodedToken.id; // Extract the school ID from the decoded token

    // }
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
};
