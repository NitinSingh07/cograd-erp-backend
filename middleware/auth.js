const { getSchool } = require("../service/schoolAuth");

//Authentication
function checkForAuthentication(req, res, next) {

    const tokenCookie = req.cookies?.token;
    req.user = null;

    if (!tokenCookie)
        return next();

    const token = tokenCookie;
    // Retrieve user information based on the token

    const user = getSchool(token);
    // console.log("auth.js token", user);
    req.user = user;
    return next();
}
//we will pass roles in an array, because maybe there are something which will be accessed by both user and admin 
//the above function just do a soft check on user, but below function restricts it actually

//Authorization
function restrictTo(roles = []) {
    return function (req, res, next) {
        if (!req.user)
            return res.redirect("/login")

        if (!roles.includes(req.user.role))
            return res.end("UnAuthorized")

        return next(); // User is authorized
    }

}
const { getTeacher } = require("../service/teacherAuth");

function checkForTeacherAuthentication(req, res, next) {
    const token = req.cookies?.teacherToken;
    req.teacher = null;

    if (!token) {
        return next(); // If no token, move on
    }

    const teacher = getTeacher(token);
    req.teacher = teacher;
    
    return next(); // Token valid, continue
}

function restrictTeacherTo(roles = []) {
    return function (req, res, next) {
        if (!req.teacher) {
            return res.status(401).send("Unauthorized");
        }

        if (!roles.includes(req.teacher.role)) {
            return res.status(403).send("Forbidden");
        }

        return next(); // User authorized, continue
    };
}
function checkForClassTeacherAuthentication(req, res, next) {
    const token = req.cookies?.teacherToken; // Assuming "teacherToken" is the token for class teachers
    req.classTeacher = null;
  
    if (!token) {
      return next(); // If no token, move on
    }
  
    const classTeacher = getClassTeacher(token); // Validate token
    req.classTeacher = classTeacher; // Set class teacher information
    
    return next(); // Token is valid, continue
  }
  
  function restrictClassTeacherTo(roles = []) {
    return function (req, res, next) {
      if (!req.classTeacher) {
        return res.status(401).send("Unauthorized");
      }
  
      if (!roles.includes(req.classTeacher.role)) {
        return res.status(403).send("Forbidden");
      }
  
      return next(); // User is authorized
    };
  }
module.exports = {
    checkForAuthentication,
    restrictTo, checkForTeacherAuthentication,
    restrictTeacherTo, checkForClassTeacherAuthentication,
    restrictClassTeacherTo,
};
