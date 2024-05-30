const jwt = require("jsonwebtoken");
const secret = "YourSecretKeyHere";

function setTeacher(teacher) {
  const payload = {
    id: teacher._id,
    email: teacher.email,
    role: teacher.role,
  };
  return jwt.sign(payload, secret, { expiresIn: "1h" });
}

function getTeacher(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

module.exports = {
  setTeacher,
  getTeacher,
};
