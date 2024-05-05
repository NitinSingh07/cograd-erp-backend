const jwt = require('jsonwebtoken');
const secret = "itisVarunUapdhyaySecretKey";

// Generate a JWT token for parents
function setParent(parent) {
    const payload = {
        id: parent._id,
        email: parent.email,
        role: "PARENT", // role for parents
    };
    return jwt.sign(payload, secret, { expiresIn: '1h' });
}

// Verify and decode the JWT token for parents
function getParent(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        console.error("JWT Verification error:", error);
        return null;
    }
}

module.exports = { setParent, getParent };
