const Class = require("../models/classModel");

exports.ClassCreate = async (req, res) => {
  try {
    const sclass = new Class({
      className: req.body.className,
      school: req.body.schoolId,
    });

    const existingClassByName = await Class.findOne({
      className: req.body.ClassName,
      school: req.body.schoolId,
    });

    if (existingClassByName) {
      res.send({ message: "Sorry this class name already exists" });
    } else {
      const result = await sclass.save();
      const response = await result.populate("school", "schoolName");
      res.status(200).json(response);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.classList = async (req, res) => {
  try {
    let sclasses = await Class.find({ school: req.params.id });
    if (sclasses.length > 0) {
      res.send(sclasses);
    } else {
      res.send({ message: "No sclasses found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getClassDetail = async (req, res) => {
  try {
    let sclass = await Class.findById(req.params.id);
    if (sclass) {
      sclass = await sclass.populate("school");
      res.send(sclass);
    } else {
      res.send({ message: "No class found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) {
      return res.send({ message: "Class not found" });
    }
    // const deletedStudents = await Student.deleteMany({
    //   className: req.params.id,
    // });
    await Subject.deleteMany({
      className: req.params.id,
    });
    await Teacher.updateMany(
      { "teachSubjects.class": req.params.id },
      { $pull: { teachSubjects: { class: req.params.id } } }
    );
    res.send(deletedClass);
  } catch (error) {
    res.status(500).json(error);
  }
};

// const deleteSclasses = async (req, res) => {
//   try {
//     const deletedClasses = await Sclass.deleteMany({ school: req.params.id });
//     if (deletedClasses.deletedCount === 0) {
//       return res.send({ message: "No classes found to delete" });
//     }
//     const deletedStudents = await Student.deleteMany({ school: req.params.id });
//     const deletedSubjects = await Subject.deleteMany({ school: req.params.id });
//     const deletedTeachers = await Teacher.deleteMany({ school: req.params.id });
//     res.send(deletedClasses);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// };
