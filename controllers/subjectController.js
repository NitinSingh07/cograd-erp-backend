
const { getSchool } = require("../service/schoolAuth");

const Subject = require("../models/subjectModel");
const Teacher = require("../models/teacherModel");
exports.subjectCreate = async (req, res) => {
  try {
    const token = req.cookies?.token; // Retrieve the JWT token from the cookies
    const decodedToken = getSchool(token); // Decode the token to extract school information
    
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const subjects = req.body.subjects.map((subject) => ({
      subName: subject.subName,
      subCode: subject.subCode,
      className: req.body.className,
      school: decodedToken.id, // Use the school ID from the decoded token
    }));

    for (const subject of subjects) {
      const existingSubject = await Subject.findOne({
        subCode: subject.subCode,
        school: decodedToken.id,
      });

      if (existingSubject) {
        return res.send({
          message: `Subject with subCode ${subject.subCode} already exists for this school`,
        });
      }
    }

    const result = await Subject.insertMany(subjects);
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.allSubjects = async (req, res) => {
  try {
    const token = req.cookies?.token; // Retrieve the JWT token from the cookies
    const decodedToken = getSchool(token); // Decode the token to extract school information
    
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const schoolId = decodedToken.id; // Use the school ID from the decoded token

    const subjects = await Subject.find({ school: schoolId }).populate(
      "school",
      "schoolName"
    );

    if (subjects.length > 0) {
      res.send(subjects);
    } else {
      res.send({ message: "No subjects found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.classSubjects = async (req, res) => {
  try {
    const token = req.cookies?.token; // Retrieve the JWT token from the cookies
    const decodedToken = getSchool(token); // Decode the token to extract school information
    
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const schoolId = decodedToken.id; // Use the school ID from the decoded token

    const subjects = await Subject.find({
      className: req.params.id,
      school: schoolId, // Ensure it's for the current school
    })
      .populate("teacher", "name")
      .populate("className", "className");

    if (subjects.length > 0) {
      res.send(subjects);
    } else {
      res.send({ message: "No subjects found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.freeSubjectList = async (req, res) => {
  try {
    const token = req.cookies?.token; // Retrieve the JWT token from the cookies
    const decodedToken = getSchool(token); // Decode the token to extract school information
    
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const schoolId = decodedToken.id; // Use the school ID from the decoded token

    const subjects = await Subject.find({
      className: req.params.id,
      teacher: { $exists: false },
      school: schoolId, // Ensure it's for the current school
    });

    if (subjects.length > 0) {
      res.send(subjects);
    } else {
      res.send({ message: "No subjects found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


