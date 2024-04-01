const Subject = require("../models/subjectModel");
const Teacher = require("../models/teacherModel");

exports.subjectCreate = async (req, res) => {
  try {
    const subjects = req.body.subjects.map((subject) => ({
      subName: subject.subName,
      subCode: subject.subCode,
    }));

    for (const subject of subjects) {
      const existingSubject = await Subject.findOne({
        subCode: subject.subCode,
        school: req.body.schoolId,
      });

      if (existingSubject) {
        return res.send({
          message: `Subject with subCode ${subject.subCode} already exists for this school`,
        });
      }
    }

    const newSubjects = subjects.map((subject) => ({
      ...subject,
      className: req.body.className,
      school: req.body.schoolId,
    }));

    const result = await Subject.insertMany(newSubjects);
    res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.allSubjects = async (req, res) => {
  try {
    const { schoolId } = req.body;
    let subjects = await Subject.find({ school: schoolId }).populate(
      "school",
      "schoolName"
    );
    if (subjects.length > 0) {
      res.send(subjects);
    } else {
      res.send({ message: "No subjects found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.classSubjects = async (req, res) => {
  try {
    let subjects = await Subject.find({
      className: req.params.id,
    })
      .populate("teacher", "name")
      .populate("className", "className");
    if (subjects.length > 0) {
      res.send(subjects);
    } else {
      res.send({ message: "No subjects found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.freeSubjectList = async (req, res) => {
  try {
    let subjects = await Subject.find({
      className: req.params.id,
      teacher: { $exists: false },
    });
    if (subjects.length > 0) {
      res.send(subjects);
    } else {
      res.send({ message: "No subjects found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
