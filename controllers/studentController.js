const bcrypt = require("bcrypt");
const StudentModel = require("../models/studentSchema.js"); // Rename import to avoid conflict
const { setStudent } = require("../service/studentAuth.js");
const {getSchool} = require("../service/schoolAuth.js");
const studentRegister = async (req, res) => {
  const { name, email, password,  className } = req.body;
  const token = req.cookies?.token; // Retrieve the JWT token from the cookies
  const decodedToken = getSchool(token); // Decode the token to extract school information
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const student = new StudentModel({
      name,
      email,
      password: hashedPass,
      
      className,
      schoolName: decodedToken.id// corrected from 'school'
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
      res.send(response);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const studentLogIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const student = await StudentModel.findOne({ email });
    if (student) {
      const passwordMatch = await bcrypt.compare(password, student.password);
      if (passwordMatch) {
        student.password = undefined;

        const token = setStudent(student);
        res.cookie("studentToken", token);
        res.status(200).send(student);
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
    })
      .select("-password")
      .populate("className", "className") // Assuming className is a reference to Class model with name field
      .populate("schoolName", "schoolName");

    if (studentList.length > 0) {
      res.send(studentList);
    } else {
      res.status(404).send({ message: "No student found" });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

module.exports = {
  studentList,
  studentRegister,
  studentLogIn,
  getStudentDetail,
};
