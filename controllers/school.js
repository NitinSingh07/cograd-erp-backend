const bcrypt = require("bcryptjs");
const School = require("../models/school");
const { setSchool } = require("../service/schoolAuth");

exports.schoolRegister = async (req, res) => {
  try {
    // Check if email or school name already exists
    const existingSchoolByEmail = await School.findOne({
      email: req.body.email,
    });
    const existingSchool = await School.findOne({
      schoolName: req.body.schoolName,
    });

    if (existingSchoolByEmail) {
      return res.send({ message: "Email already exists" });
    } else if (existingSchool) {
      return res.send({ message: "School name already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 is the salt rounds
    const school = new School({
      ...req.body,
      password: hashedPassword, // Store the hashed password
    });

    // Generate token for the newly signed-up school
    const token = setSchool(school);
    res.cookie("token", token);
    console.log("school-token", token);
    let result = await school.save();
    result.password = undefined; // Do not send password back
    res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.schoolLogIn = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res
        .status(400)
        .send({ message: "Email and password are required" });
    }

    let school = await School.findOne({ email: req.body.email });
    if (!school) {
      return res.status(404).send({ message: "School not found" });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(req.body.password, school.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid password" });
    }

    school.password = undefined; // Remove password from the response
    const token = setSchool(school);
    res.cookie("token", token);

    return res.status(200).send(school);
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};
