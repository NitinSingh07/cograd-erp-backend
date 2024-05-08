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

    const formattedStudents = students.map((student) => ({
      studentId: student.studentId,
      fees: student.fees, // If fees are not provided, default to 0
    }));

    const parent = new ParentModel({
      name,
      email,
      password: hashedPassword,
      qualification,
      designation,
      contact,
      photo: myCloud.secure_url,
      students, // Assign the formatted students array
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

exports.calculateRemainingAmount = async (req, res) => {
  try {
    const parentId = req.params.id;

    // Find the parent by ID
    const parent = await ParentModel.findById(parentId).populate({
      path: "students.studentId",
      select: "-password", // Exclude the password field
      populate: {
        path: "className", // Path to the referenced model
        select: "className", // Select the fields you want to include
      },
    });
    if (!parent) {
      return res.status(404).json({ error: "Parent not found" });
    }

    // Calculate total fees of all students
    const totalFees = parent.students.reduce((total, student) => {
      return total + student.fees;
    }, 0);

    // Calculate total amount paid by the parent
    const totalPaidAmount = parent.payments.reduce((total, payment) => {
      return total + payment.paidAmount;
    }, 0);

    const totalFeesDetails = parent.students;
    const totalFeesPaidDetails = parent.payments;

    // Calculate remaining amount
    const remainingAmount = totalFees - totalPaidAmount;

    res.status(200).json({
      totalFees,
      totalPaidAmount,
      remainingAmount,
      totalFeesDetails,
      totalFeesPaidDetails,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updateFeesPaid = async (req, res) => {
  try {
    const parentId = req.params.id;
    const { amountPaid } = req.body;

    const parent = await ParentModel.findById(parentId);

    if (!parent) {
      return res.status(404).json({ error: "Parent not found" });
    }

    // Calculate total fees of all students
    const totalFees = parent.students.reduce((total, student) => {
      return total + student.fees;
    }, 0);

    // Calculate total amount paid by the parent
    const totalPaidAmount = parent.payments.reduce((total, payment) => {
      return total + payment.paidAmount;
    }, 0);

    const date = Date.now();
    const remainingAmount = totalFees - (totalPaidAmount + amountPaid);

    parent.payments.push({
      paidAmount: amountPaid,
      date: date,
      remainingAmount: remainingAmount,
    });

    // Save the updated parent document
    await parent.save();

    res.status(200).json({ message: "Payment updated successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.parentDetails = async (req, res) => {
  try {
    const parentId = req.params.id;

    const parent = await ParentModel.findById(parentId).populate({
      path: "students.studentId",
      select: "-password", // Exclude the password field
      populate: {
        path: "className", // Path to the referenced model
        select: "className", // Select the fields you want to include
      },
    });

    if (!parent) {
      return res.status(404).json({ error: "Parent not found" });
    }

    res.status(200).json(parent);
  } catch (err) {
    res.status(500).json(err);
  }
};
