
const jwt = require('jsonwebtoken')
const secret = "itisVarunUapdhyaySecretKey"

function setSchool(school) {
    const payload = {
        id: school.id,
        email: school.email,
        role: school.role, 
    };
    return jwt.sign(payload, secret);
}


function getSchool(token) {
    if (!token) return null
    try {
        return jwt.verify(token, secret)
    } catch (error) {
        return null
    }
}
module.exports = {
    setSchool, getSchool
}
