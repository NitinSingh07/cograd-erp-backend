const bcrypt = require("bcrypt");
const classTeacherModel = require("../models/classTeacherModel");
const classModel = require("../models/classModel");
const { getSchool } = require("../service/schoolAuth");
const { setClassTeacher, getClassTeacher } = require("../service/classTeacherAuth");
const express = require("express");
const router = express.Router();

const classTeacherRegister = async (req, res) => {
  try {
    const token = req.cookies?.token; // Retrieve the JWT token from the cookies
    const decodedToken = getSchool(token); // Decode the token to extract school information

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { email, password, className, teacherId } = req.body;
    const schoolId = decodedToken.id; // Use the school ID from the decoded token

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const classTeacher = new classTeacherModel({
      email,
      password: hashedPass,
      role: "CLASS-TEACHER",
      className,
      school: schoolId,
      teacherId,
    });

    const classExist = await classModel.findOne({ _id: className });

    const existingClassTeacherByEmail = await classTeacherModel.findOne({
      email,
    });
    const existingClass = await classTeacherModel.findOne({ className });

    const emailDomain = email.split("@")[1];
    const validDomain = emailDomain === "cograd.in";

    if (existingClassTeacherByEmail) {
      res.send({ message: "Email already exists" });
    } else if (existingClass) {
      res.send({ message: "Class already exists" });
    } else if (!classExist) {
      res.send({ message: "Class doesn't exist" });
    } else if (!validDomain) {
      res.send({
        message: "Email domain is not valid. It should be @cograd.in",
      });
    } else {
      const result = await classTeacher.save();
      result.password = undefined;
      const response = await result.populate("className", "className");
      res.send(response);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const classTeacherLogIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the class teacher by email
    let classTeacher = await classTeacherModel.findOne({ email });

    if (!classTeacher) {
      return res.status(404).json({ message: "Class teacher not found" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, classTeacher.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Hide the password in the response
    classTeacher.password = undefined;

    // Generate a JWT token for the class teacher
    const classTeacherToken = setClassTeacher(classTeacher);

    // Set the token in a cookie
    // Set the token in a cookie
    res.cookie("classTeacherToken", classTeacherToken);

    console.log("classTeacherToken", classTeacherToken);
    // Send a successful response

    res.status(200).json(classTeacher);
  } catch (error) {
    console.error("Error during class teacher login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const checkClassTeacher = async (req, res) => {
  try {
    try {
      const { teacherId } = req.params;
  
      const classTeacher = await classTeacherModel.findOne({ teacherId });
  
      if (classTeacher) {
        return res.status(200).json({ isClassTeacher: true, classTeacher });
      } else {
        return res.status(200).json({ isClassTeacher: false });
      }
    } catch (err) {
      console.error("Error checking class teacher status:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.error("Error during class teacher login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




const getClassTeacherDetail = async (req, res) => {
  try {
    const token = req.cookies?.token; // Retrieve the JWT token from the cookies
    const decodedToken = getSchool(token); // Decode the token to extract school information

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const schoolId = decodedToken.id; // Use the school ID from the decoded token

    const classTeacher = await classTeacherModel.find({ school: schoolId });
    if (classTeacher.length) {
      classTeacher.forEach((ct) => {
        ct.password = undefined; // Hide the password
      });
      res.send(classTeacher);
    } else {
      res.status(404).send({ message: "No classTeacher found for this school" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  classTeacherRegister,
  classTeacherLogIn,
  getClassTeacherDetail,
  checkClassTeacher
};
