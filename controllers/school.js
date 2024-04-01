const School = require("../models/school");

exports.schoolRegister = async (req, res) => {
  try {
    const school = new School({
      ...req.body,
    });

    const existingSchoolByEmail = await School.findOne({
      email: req.body.email,
    });
    const existingSchool = await School.findOne({
      schoolName: req.body.schoolName,
    });

    if (existingSchoolByEmail) {
      res.send({ message: "Email already exists" });
    } else if (existingSchool) {
      res.send({ message: "School name already exists" });
    } else {
      let result = await school.save();
      result.password = undefined;
      res.send(result);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.schoolLogIn = async (req, res) => {
  if (req.body.email && req.body.password) {
    let school = await School.findOne({ email: req.body.email });
    if (school) {
      if (req.body.password === school.password) {
        school.password = undefined;
        res.send(school);
      } else {
        res.send({ message: "Invalid password" });
      }
    } else {
      res.send({ message: "School not found" });
    }
  } else {
    res.send({ message: "Email and password are required" });
  }
};
