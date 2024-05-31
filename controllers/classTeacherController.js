const bcrypt = require("bcrypt");
const classTeacherModel = require("../models/classTeacherModel");
const classModel = require("../models/classModel");
const { getSchool } = require("../service/schoolAuth");
const {
  setClassTeacher,
  getClassTeacher,
} = require("../service/classTeacherAuth");
const express = require("express");
const { TokenInstance } = require("twilio/lib/rest/oauth/v1/token");

const classTeacherRegister = async (req, res) => {
  try {
 const { email, password, className, teacherId, schoolId } = req.body;


    // Check if all required fields are present
    if (!email || !password || !className || !teacherId || !schoolId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email domain is valid
    const emailDomain = email.split("@")[1];
    const validDomain = emailDomain === "cograd.in";
    if (!validDomain) {
      return res.status(400).json({
        message: "Email domain is not valid. It should be @cograd.in",
      });
    }

    // Check if the class exists
    const classExist = await classModel.findOne({ _id: className });
    if (!classExist) {
      return res.status(400).json({ message: "Class doesn't exist" });
    }

    // Check if the email already exists
    const existingClassTeacherByEmail = await classTeacherModel.findOne({ email });
    if (existingClassTeacherByEmail) {
      return res.status(400).json({ message: "Class Email already exists" });
    }

    // Check if there is already a class teacher for this class
    const existingClassTeacher = await classTeacherModel.findOne({ className });
    if (existingClassTeacher) {
      return res
        .status(400)
        .json({ message: "Class Teacher for this class already exists" });
    }

    // Check if the teacher is already a class teacher
    const classTeacherExist = await classTeacherModel.findOne({ teacherId });
    if (classTeacherExist) {
      return res
        .status(400)
        .json({ message: "Teacher already a class teacher" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    // Create a new class teacher instance
    const classTeacher = new classTeacherModel({
      email,
      password: hashedPass,
      role: "CLASS-TEACHER",
      className,
      school: schoolId,
      teacherId,
    });

    // Save the class teacher to the database
    const result = await classTeacher.save();

    // Omit password from the response
    result.password = undefined;

    // Populate the className field in the response
    const response = await result.populate("className", "className")

    // Send the response
    res.send(response);
  } catch (err) {
    console.error("Error in class teacher registration:", err);
    res.status(500).json({ message: "Internal server error" });
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

const getAllClassTeacherDetail = async (req, res) => {
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
      res
        .status(404)
        .send({ message: "No classTeacher found for this school" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getClassTeacherDetail = async (req, res) => {
  try {
 const classTeacherId = req.params.id;
    if (!classTeacherId ) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const classTeacher = await classTeacherModel
      .findById(classTeacherId)
      .populate("className", "className") // Populate the className field with className only
      .populate("school", "schoolName") // Populate the school field with schoolName only
      .populate("teacherId", "name email"); // Populate the teacherId field with name and email only

    if (classTeacher) {
      res.send(classTeacher);
    } else {
      res
        .status(404)
        .send({ message: "No classTeacher is registered to this id" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  classTeacherRegister,
  classTeacherLogIn,
  getClassTeacherDetail,
  checkClassTeacher,
  getClassTeacherDetail,
  getAllClassTeacherDetail,
};
