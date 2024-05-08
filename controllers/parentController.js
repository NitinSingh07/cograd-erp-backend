const bcrypt = require("bcrypt");
const ParentModel = require("../models/parentModel");
const { setParent, getParent } = require("../service/parentAuth");
const getDataUri = require("../utils/dataUri");
const School = require("../models/school");
const cloudinary = require("cloudinary").v2;

exports.parentRegister = async (req, res) => {
  const {
    name,
    email,
    password,
    qualification,
    designation,
    contact,
    students,
  } = req.body;
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //Done using multer
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Photo is required" });
    }

    const existingEmail = await ParentModel.findOne({ email });
    if (existingEmail) {
      return res.status(401).json({ err: "Email already exists" });
    }

    const photoUri = getDataUri(file);

    const myCloud = await cloudinary.uploader.upload(photoUri.content);

    const parent = new ParentModel({
      name,
      email,
      password: hashedPassword,
      qualification,
      designation,
      photo: myCloud.secure_url,
      contact,
      students,
    });

    // Save the parent to the database
    const result = await parent.save();

    // Return success response with the token
    res.status(200).json({
      message: "Parent registered successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error registering parent:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.parentLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find parent by email
    const parent = await ParentModel.findOne({ email });

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, parent.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Hide the password
    parent.password = undefined;

    // Generate JWT token for the parent
    const parentToken = setParent(parent);

    // Set the token in the response or in a cookie (optional)
    res.cookie("parentToken", parentToken);
    res.status(200).json({
      message: "Parent logged in successfully",
      parentToken: parentToken,
      data: parent,
    });
  } catch (error) {
    console.error("Error logging in parent:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
