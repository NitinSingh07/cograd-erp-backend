const ComplaintBox = require("../models/complaintBox");
const { getClassTeacher } = require("../service/classTeacherAuth");
const { getParent } = require("../service/parentAuth");
const { getSchool } = require("../service/schoolAuth");
const { getstudent } = require("../service/studentAuth");
const Student = require("../models/studentSchema");
const Parent = require("../models/parentModel");
const Teacher = require("../models/teacherModel");
const ClassTeacher = require("../models/classTeacherModel");
const { getTeacher } = require("../service/teacherAuth");

exports.registeredComplains = async (req, res) => {
  try {
    const { message, role, id } = req.body;

    const date = Date.now();

    if (role === "student") {
      const student = await Student.findById(id);
      if (!student) {
        return res.status(402).json({ error: "Student not found" });
      }
      const complain = new ComplaintBox({
        message,
        role,
        studentId: id,
        date,
      });

      await complain.save();
    } else if (role === "parent") {
      const parent = await Parent.findById(id);
      if (!parent) {
        return res.status(402).json({ error: "Student not found" });
      }
      const complain = new ComplaintBox({
        message,
        role,
        parentId: id,
      });

      await complain.save();
    } else if (role === "teacher") {
      const teacher = await Teacher.findById(id);
      if (!teacher) {
        return res.status(402).json({ error: "Student not found" });
      }
      const complain = new ComplaintBox({
        message,
        role,
        teacherId: id,
      });

      await complain.save();
    } else if (role === "classTeacher") {
      const classTeacher = await ClassTeacher.findById(id);
      if (!classTeacher) {
        return res.status(402).json({ error: "Student not found" });
      }
      const complain = new ComplaintBox({
        message,
        role,
        classTeacherId: id,
      });

      await complain.save();
    } else {
      return res.status(401).json({ error: "Role is invalid" });
    }

    res.status(200).json({ message: "Complain saved" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.allComplains = async (req, res) => {
  try {
    const token = req.cookies?.token;

    const decodedToken = getSchool(token);

    if (!decodedToken && !decodedToken.id) {
      return res.status(402).json({ error: "Unauthorized" });
    }

    const complains = await ComplaintBox.find({});

    if (!complains) {
      return res.status(404).json({ message: "No complains found" });
    }

    res.status(200).json(complains);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.studentComplains = async (req, res) => {
  try {
    const token = req.cookies?.studentToken;

    const decodedToken = getstudent(token);

    if (!decodedToken && !decodedToken.id) {
      return res.status(402).json({ error: "Unauthorized" });
    }

    const complains = await ComplaintBox.find({ studentId: decodedToken.id });

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

    const complains = await ComplaintBox.find({ teacherId: decodedToken.id });

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

    const complains = await ComplaintBox.find({ parentId: decodedToken.id });

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
    });

    if (!complains) {
      return res.status(404).json({ message: "No complains found" });
    }

    res.status(200).json(complains);
  } catch (err) {
    res.status(500).json(err);
  }
};
