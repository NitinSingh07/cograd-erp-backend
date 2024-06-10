const { getSchool } = require("../service/schoolAuth");
const Class = require("../models/classModel");
const Subject = require("../models/subjectModel");
const Student = require("../models/studentSchema");
const ClassTeacher = require("../models/classTeacherModel");
const examResultModel = require("../models/examResultModel");
exports.ClassCreate = async (req, res) => {
  try {
    const school = req.params.id;

    if (!school) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const sclass = new Class({
      className: req.body.className,
      school: school,
    });

    const existingClassByName = await Class.findOne({
      className: req.body.className,
      school: school,
    });

    if (existingClassByName) {
      return res
        .status(400)
        .send({ message: "Sorry, this class name already exists" });
    }

    const result = await sclass.save();
    const response = await result.populate("school", "schoolName");
    res.status(200).json(response);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.classList = async (req, res) => {
  try {
    const school = req.params.id;

    if (!school) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (school) {
      const sclasses = await Class.find({ school }, { _id: 1, className: 1 });
      if (sclasses.length > 0) {
        return res.status(200).json(sclasses); // 200 OK if classes exist
      } else {
        return res.status(404).send({ message: "No classes found" }); // 404 if no classes
      }
    }
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" }); // 500 for server errors
  }
};

exports.getClassDetail = async (req, res) => {
  try {
    const sclass = await Class.findById(req.params.id).populate("school");
    if (sclass) {
      res.send(sclass);
    } else {
      res.status(404).send({ message: "Class not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.deleteClass = async (req, res) => {
  try {
    // Check if the class exists
    const existingClass = await Class.findById(req.params.id);
    if (!existingClass) {
      return res.status(404).send({ message: "Class not found" });
    }

    // Delete all subjects associated with the class
    await Subject.deleteMany({ className: req.params.id });

    // Delete all students associated with the class
    const students = await Student.find({ className: req.params.id });

    if (students) {
      for (const student of students) {
        await examResultModel.deleteOne({ student: student._id });
      }
    }

    await Student.deleteMany({ className: req.params.id });

    // Delete the class teacher associated with the class
    await ClassTeacher.deleteOne({ className: req.params.id });

    // Delete the class
    await Class.findByIdAndDelete(req.params.id);

    // Send success response
    res.status(200).json({
      message: "Class and all associated entities deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateClassName = async (req, res) => {
  try {
    const { id } = req.params;
    const { className } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Class ID is required" });
    }

    if (!className) {
      return res.status(400).json({ message: "Class Name is required" });
    }

    const existingClass = await Class.findById(id);
    if (!existingClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if the new className already exists for the same school
    const existingClassByName = await Class.findOne({
      className,
      school: existingClass.school,
      _id: { $ne: id }, // Exclude the current class
    });

    if (existingClassByName) {
      return res
        .status(400)
        .json({ message: "Sorry, this class name already exists" });
    }

    existingClass.className = className;
    const updatedClass = await existingClass.save();

    res.status(200).json(updatedClass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
