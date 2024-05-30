const mongoose = require("mongoose");
const ComplaintBox = require("../models/complaintBox");
const { getClassTeacher } = require("../service/classTeacherAuth");
const { getParent } = require("../service/parentAuth");
const { getSchool } = require("../service/schoolAuth");
const { getstudent } = require("../service/studentAuth");
const Student = require("../models/studentSchema");
const Parent = require("../models/parentModel");
const Teacher = require("../models/teacherModel");
const cloudinaryUploader = require("../utils/cloudinaryUplaoder");
const { getTeacher } = require("../service/teacherAuth");
exports.registeredComplains = async (req, res) => {
  try {
    const { message, role, id, schoolId } = req.body;

    if (!role || !id || !schoolId || (!message && !req.file)) {
      const missingFields = [];
      if (!role) missingFields.push("role");
      if (!id) missingFields.push("id");
      if (!schoolId) missingFields.push("schoolId");
      if (!message && !req.file) missingFields.push("message or file");

      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
    }

    if (req.fileValidationError) {
      return res
        .status(400)
        .json({ message: `File validation error: ${req.fileValidationError}` });
    }

    let audioResponse = null;
    if (req.file) {
      // Invoke the uploader function to handle the upload to cloudinary
      audioResponse = await cloudinaryUploader(req, res);
    }

    const date = Date.now();
    let complain;

    if (role === "STUDENT") {
      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      complain = new ComplaintBox({
        message,
        role,
        studentId: id,
        schoolId,
        date,
        audio: audioResponse ? audioResponse.secure_url : null,
        status: "UNRESOLVED",
        referredTo: null, // Default referredTo is null, meaning principal is the default resolver
      });

      await complain.save();
    } else if (role === "PARENT") {
      const parent = await Parent.findById(id);
      if (!parent) {
        return res.status(404).json({ error: "Parent not found" });
      }
      complain = new ComplaintBox({
        message,
        role,
        parentId: id,
        schoolId,
        date,
        audio: audioResponse ? audioResponse.secure_url : null,
        status: "UNRESOLVED",
        referredTo: null, // Default referredTo is null, meaning principal is the default resolver
      });

      await complain.save();
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    res.status(200).json({ message: "Complaint saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.allComplains = async (req, res) => {
  try {
    const token = req.cookies?.token;

    const decodedToken = getSchool(token);

    if (!decodedToken && !decodedToken.id) {
      return res.status(402).json({ error: "Unauthorized" });
    }


    const complains = await ComplaintBox.find({ schoolId: decodedToken.id })
      .populate('parentId')
      .populate('studentId');

    if (!complains) {
      return res.status(404).json({ message: "No complains found" });
    }

    res.status(200).json(complains);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.complaintsByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    // Convert the date to the start and end timestamps of the day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const complaints = await ComplaintBox.find({
      schoolId: req.schoolId,
      date: {
        $gte: startDate.getTime(),
        $lte: endDate.getTime(),
      },
    });

    if (!complaints || complaints.length === 0) {
      return res
        .status(404)
        .json({ message: "No complaints found for the specified date" });
    }

    res.status(200).json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.studentComplains = async (req, res) => {
  try {
    const token = req.cookies?.studentToken;

    const decodedToken = getstudent(token);
console.log(decodedToken)
    if (!decodedToken && !decodedToken.id) {
      return res.status(402).json({ error: "Unauthorized" });
    }

    const complains = await ComplaintBox.find({
      studentId: decodedToken.id,
     
    });

    if (!complains) {
      return res.status(404).json({ message: "No complains found" });
    }

    res.status(200).json(complains);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.teacherComplains = async (req, res) => {
  try {
    const token = req.cookies?.teacherToken;

    const decodedToken = getTeacher(token);

    if (!decodedToken && !decodedToken.id) {
      return res.status(402).json({ error: "Unauthorized" });
    }

    const complains = await ComplaintBox.find({
      teacherId: decodedToken.id,
    });

    if (!complains) {
      return res.status(404).json({ message: "No complains found" });
    }

    res.status(200).json(complains);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.parentComplains = async (req, res) => {
  try {
    const token = req.cookies?.parentToken;

    const decodedToken = getParent(token);

    if (!decodedToken && !decodedToken.id) {
      return res.status(402).json({ error: "Unauthorized" });
    }

    const complains = await ComplaintBox.find({
      parentId: decodedToken.id,
    });

    if (!complains) {
      return res.status(404).json({ message: "No complains found" });
    }

    res.status(200).json(complains);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.classTeacherComplains = async (req, res) => {
  try {
    const token = req.cookies?.classTeacherToken;

    const decodedToken = getClassTeacher(token);

    if (!decodedToken && !decodedToken.id) {
      return res.status(402).json({ error: "Unauthorized" });
    }

    const complains = await ComplaintBox.find({
      classTeacherId: decodedToken.id,
      schoolId: req.schoolId,
    });

    if (!complains) {
      return res.status(404).json({ message: "No complains found" });
    }

    res.status(200).json(complains);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.referComplaint = async (req, res) => {
  try {
    const { complaintId, teacherId } = req.body;

    // Find the complaint by ID
    const complaint = await ComplaintBox.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Check if the complaint is already referred or resolved
    if (complaint.referredTo) {
      return res.status(400).json({ message: "Complaint is already referred and cannot be referred again" });
    } else if (complaint.status === "RESOLVED") {
      return res.status(400).json({ message: "Complaint is already resolved and cannot be referred" });
    }

    // Find the teacher by ID
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Update the complaint with the new teacher ID
    complaint.referredTo = teacherId;
    await complaint.save();

    res.status(200).json({ message: "Complaint referred to teacher", complaint });
  } catch (err) {
    console.error("Error referring complaint:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.resolveComplaint = async (req, res) => {
  try {
    const { complaintId } = req.body;

    const complaint = await ComplaintBox.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.status === "RESOLVED") {
      return res.status(400).json({ message: "Complaint is already resolved" });
    }

    complaint.status = "RESOLVED";
    await complaint.save();

    res.status(200).json({ message: "Complaint resolved", complaint });
  } catch (err) {
    res.status(500).json({ message: "Error resolving complaint", error: err.message });
  }
};
exports.complaintsReferredToTeacher = async (req, res) => {
  try {
    const token = req.cookies?.teacherToken;

    const decodedToken = getTeacher(token);

    if (!decodedToken && !decodedToken.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const teacherId = decodedToken.id;

    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    const complaints = await ComplaintBox.find({
      referredTo: teacherId,
    }).populate('parentId').populate('studentId');

    if (!complaints || complaints.length === 0) {
      return res.status(404).json({ message: "No complaints found for this teacher" });
    }

    res.status(200).json(complaints);
  } catch (err) {
    console.error("Error fetching complaints referred to teacher:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    const { complaintId, message } = req.body;

    // Find the complaint by ID
    const complaint = await ComplaintBox.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Update the complaint message
    complaint.message = message;
    await complaint.save();

    res.status(200).json({ message: "Complaint updated", complaint });
  } catch (err) {
    console.error("Error updating complaint:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.body;

    // Find and delete the complaint by ID
    const deletedComplaint = await ComplaintBox.findByIdAndDelete(complaintId);
    if (!deletedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({ message: "Complaint deleted", complaint: deletedComplaint });
  } catch (err) {
    console.error("Error deleting complaint:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
