const jwt = require("jsonwebtoken");
const secret = "YourSecretKeyHere";

function setStudent(student) {
  const payload = {
    id: student._id,
    email: student.email,
    name: student.name,
    role: student.role,
  };
  return jwt.sign(payload, secret, { expiresIn: "1h" });
}

function getstudent(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

module.exports = {
  setStudent,
  getstudent,
};
