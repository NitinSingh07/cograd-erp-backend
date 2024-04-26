const jwt = require('jsonwebtoken');
const secret = "itisVarunUapdhyaySecretKey";

function setClassTeacher(classTeacher) {
    const payload = {
        id: classTeacher._id,
        email: classTeacher.email,
        role: classTeacher.role, // should be "CLASS-TEACHER"
    };
    return jwt.sign(payload, secret, { expiresIn: '1h' });
}

function getClassTeacher(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        console.error("JWT Verification error:", error);
        return null;
    }
}

module.exports = { setClassTeacher, getClassTeacher };
