const { getSchool } = require("../service/schoolAuth");
const Class = require("../models/classModel");
exports.ClassCreate = async (req, res) => {
  try {
    const token = req.cookies?.token;
    const decodedToken = getSchool(token);

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const schoolId = decodedToken.id;

    const sclass = new Class({
      className: req.body.className,
      school: schoolId,
    });

    const existingClassByName = await Class.findOne({
      className: req.body.className,
      school: schoolId,
    });

    if (existingClassByName) {
      return res
        .status(400)
        .json({ message: "Sorry, this class name already exists" });
    }

    const result = await sclass.save();
    const response = await result.populate("school", "schoolName");
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.classList = async (req, res) => {
  try {
    const { school } = req.body;
    const token = req.cookies?.token;
    const decodedToken = getSchool(token);

    if ((!decodedToken || !decodedToken.id) && !school) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (school) {
      const sclasses = await Class.find({ school }, { _id: 1, className: 1 });
      if (sclasses.length > 0) {
        return res.status(200).json(sclasses); // 200 OK if classes exist
      } else {
        return res.status(404).json({ message: "No classes found" }); // 404 if no classes
      }
    }

    const schoolId = decodedToken.id;

    const sclasses = await Class.find({ school: schoolId });
    if (sclasses.length > 0) {
      res.status(200).json(sclasses); // 200 OK if classes exist
    } else {
      res.status(404).json({ message: "No classes found" }); // 404 if no classes
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
      res.status(404).json({ message: "Class not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Find all subject IDs that were deleted
    const subjectIds = await Subject.find({ className: req.params.id }, "_id");
    const subjectIdArray = subjectIds.map((subject) => subject._id);

    // Update all teachers to remove the deleted subjects from their teachSubjects array
    await Teacher.updateMany(
      { teachSubjects: { $in: subjectIdArray } },
      { $pull: { teachSubjects: { $in: subjectIdArray } } }
    );
    await Subject.deleteMany({ className: req.params.id });

    res.status(200).json(deletedClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
