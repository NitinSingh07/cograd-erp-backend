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
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({ message: "Email and password are required" });
    }
    
    let school = await School.findOne({ email: req.body.email });
    if (!school) {
      return res.status(404).send({ message: "School not found" });
    }
    
    if (req.body.password !== school.password) {
      return res.status(401).send({ message: "Invalid password" });
    }
    
    // Remove password from the school object before sending it back
    school.password = undefined;
    const token = setSchool(school);
    res.cookie("token", token);
    return res.status(200).send(school);
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};
