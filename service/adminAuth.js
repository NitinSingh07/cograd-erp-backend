const jwt = require("jsonwebtoken");
const secret = "itisVarunUapdhyaySecretKey";

function setAdmin(admin) {
  const payload = {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  };
  return jwt.sign(payload, secret, { expiresIn: "1h" });
}

function getAdmin(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}
module.exports = {
  setAdmin,
  getAdmin,
};