const School = require("../models/school");
const { setSchool } = require("../service/schoolAuth");

exports.schoolRegister = async (req, res) => {
  try {
    const school = new School({
      ...req.body,
    });
    // Generate token for the newly signed up school
    const token = setSchool(school);
    console.log(token);
    // Set token in cookies
    res.cookie("token", token);
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
        const token = setSchool(school);
        res.cookie("token",token)
        console.log(token);
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
