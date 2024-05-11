const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const { setAdmin, getAdmin } = require("../service/adminAuth");

exports.adminRegister = async (req, res) => {
  try {
    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email: req.body.email });

    if (existingAdmin) {
      return res.status(400).send({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newAdmin = new Admin({
      email: req.body.email,
      password: hashedPassword,
    });
    const adminToken = setAdmin(newAdmin);
    res.cookie("adminToken", adminToken);

    let result = await newAdmin.save();
    result.password = undefined; // Do not send password back
    res.send(result);
  } catch (err) {
    console.error("Error registering admin:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({ message: "Email and password are required" });
    }

    let admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      return res.status(404).send({ message: "Admin not found" });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(req.body.password, admin.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid password" });
    }

    admin.password = undefined; // Remove password from the response
    const adminToken = setAdmin(admin);
    res.cookie("adminToken", adminToken);

    return res.status(200).send(admin);
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};
