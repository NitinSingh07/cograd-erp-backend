const bcrypt = require("bcrypt");
const ParentModel = require("../models/parentModel");
const { setParent, getParent } = require("../service/parentAuth");
const getDataUri = require("../utils/dataUri");
const { findById } = require("../models/teacherModel");
const cloudinary = require("cloudinary").v2;
const StudentModel = require("../models/studentSchema");
const { Message } = require("twilio/lib/twiml/MessagingResponse");

exports.parentRegister = async (req, res) => {
  const {
    name,
    email,
    password,
    qualification,
    designation,
    contact,
    students,
    schoolId,
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
      return res.status(401).json({ message: "Email already exists" });
    }

    const photoUri = getDataUri(file);

    const myCloud = await cloudinary.uploader.upload(photoUri.content);

    for (const student of students) {
      const fetchedStudent = await StudentModel.findById(student.studentId);
      if (fetchedStudent.fatherEmail !== email) {
        return res.status(400).json({
          message: "Email doesn't match with the student's father's email",
        });
      }
    }

    const parent = new ParentModel({
      name,
      email,
      password: hashedPassword,
      qualification,
      designation,
      school: schoolId,
      contact,
      profile: myCloud.secure_url,
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
    res.status(200).json(parent);
  } catch (error) {
    console.error("Error logging in parent:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.parentsList = async (req, res) => {
  try {
    const schoolId = req.params.id;

    if (!schoolId) {
      return res.status(400).json({ message: "Unauthorized" });
    }

    const parents = await ParentModel.find({ school: schoolId }).populate({
      path: "students.studentId",
      select: "-password", // Exclude the password field
      populate: {
        path: "className", // Path to the referenced model
        select: "className", // Select the fields you want to include
      },
    });

    if (!parents) {
      return res.status(404).json({ error: "Parents not found" });
    }

    res.status(200).json(parents);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
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
      const { admission, tuition, exams, maintenance, others } = student.fees;
      const studentTotalFees =
        admission + tuition + exams + maintenance + others;
      return total + studentTotalFees;
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
    const { schoolId, parentId, amountPaid, receipt } = req.body;

    if (!schoolId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!amountPaid || amountPaid <= 0) {
      return res.status(400).json({ message: "Invalid amount paid" });
    }

    const parent = await ParentModel.findById(parentId);

    if (!parent) {
      return res.status(404).json({ error: "Parent not found" });
    }

    const date = Date.now();

    // Calculate total fees of all students
    const totalFees = parent.students.reduce((total, student) => {
      const { admission, tuition, exams, maintenance, others } = student.fees;
      const studentTotalFees =
        admission + tuition + exams + maintenance + others;
      return total + studentTotalFees;
    }, 0);

    const lastPayment = parent.payments[parent.payments.length - 1];
    const remainingAmount = lastPayment
      ? lastPayment.remainingAmount - amountPaid
      : totalFees - amountPaid;

    if (lastPayment && lastPayment.remainingAmount === 0) {
      return res.status(400).json({ message: "Full fee is already paid" });
    }

    if (remainingAmount < 0) {
      return res.status(400).json({ message: "Amount exceeds remaining fees" });
    }

    parent.payments.push({
      paidAmount: amountPaid,
      date: date,
      receipt,
      remainingAmount: remainingAmount,
    });

    await parent.save();

    res.status(200).json({ message: "Payment updated successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.parentDetails = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Unauthorized" });
    }

    const parentId = id;
    const parent = await ParentModel.findById(parentId).populate({
      path: "students.studentId",
      select: "name profile email className", // Select fields for the student
      populate: {
        path: "className", // Populate the className field within studentId
        select: "className", // Select the className field
      },
    });

    if (!parent) {
      return res.status(404).json({ error: "Parent not found" });
    }

    // No need for additional student fetching, populate already did it
    res.status(200).json(parent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteParent = async (req, res) => {
  try {
    const parentId = req.params.id;

    // Find the parent document
    const parent = await ParentModel.findById(parentId);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    await ParentModel.findByIdAndDelete(parentId);

    res.status(200).json({ message: "Parent deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateStudentFees = async (req, res) => {
  try {
    const { parentId, studentId } = req.params;
    const { fees } = req.body;

    // Find the parent document
    const parent = await ParentModel.findById(parentId);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Find the student within the parent's students array
    const student = parent.students.id(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Store the original total fees before updating the student's fee
    const originalTotalFees = parent.students.reduce((total, student) => {
      const { admission, tuition, exams, maintenance, others } = student.fees;
      const studentTotalFees =
        admission + tuition + exams + maintenance + others;
      return total + studentTotalFees;
    }, 0);

    // Update the student's fees
    student.fees = fees;

    // Save the parent document with updated fees
    await parent.save();

    // Check if the total fees have changed
    const newTotalFees = parent.students.reduce((total, student) => {
      const { admission, tuition, exams, maintenance, others } = student.fees;
      const studentTotalFees =
        admission + tuition + exams + maintenance + others;
      return total + studentTotalFees;
    }, 0);

    if (newTotalFees !== originalTotalFees) {
      // Calculate the difference in total fees
      const feeDifference = newTotalFees - originalTotalFees;

      // Update payments data accordingly
      parent.payments.forEach((payment) => {
        payment.remainingAmount += feeDifference;
      });

      // Save the parent document with updated payments data
      await parent.save();
    }

    res.status(200).json({ message: "Student fees updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
