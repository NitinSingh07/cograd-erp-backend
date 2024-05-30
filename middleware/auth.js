const { getSchool } = require("../service/schoolAuth");
const { getClassTeacher } = require("../service/classTeacherAuth");

//Authentication
function checkForAuthentication(req, res, next) {
  const tokenCookie = req.cookies?.token;
  req.user = null;

  if (!tokenCookie) return next();

  const token = tokenCookie;
  // Retrieve user information based on the token

  const user = getSchool(token);
 
  req.user = user;
  return next();
}
//we will pass roles in an array, because maybe there are something which will be accessed by both user and admin
//the above function just do a soft check on user, but below function restricts it actually

//Authorization
function restrictTo(roles = []) {
  return function (req, res, next) {
    if (!req.user) return res.redirect("/login");

    if (!roles.includes(req.user.role)) return res.end("UnAuthorized");

    return next(); // User is authorized
  };
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
  const token = req.cookies?.classTeacherToken;
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
const { getParent } = require("../service/parentAuth");

function checkForParentAuthentication(req, res, next) {
  const token = req.cookies?.parentToken || req.headers['authorization']?.split(" ")[1];

  req.parent = null;

  if (!token) {
    return next(); // No token, proceed
  }

  const parent = getParent(token);
  req.parent = parent; // Set parent information if the token is valid

  return next(); // Continue to the next middleware
}
// function restrictParentTo(roles = []) {
//   return function (req, res, next) {
//     if (!req.parent) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     if (!roles.includes(req.parent.role)) {
//       return res.status(403).json({ message: "Forbidden" });
//     }

//     return next(); // User is authorized
//   };
// }

// module.exports = {
//   restrictParentTo,
// };




const { getAdmin } = require("../service/adminAuth");

function checkForAdminAuthentication(req, res, next) {
  const token = req.cookies?.adminToken;
  req.teacher = null;

  if (!token) {
    return next(); // If no token, move on
  }

  const admin = getAdmin(token);
  req.admin = admin;

  return next(); // Token valid, continue
}
function restrictAdminTo(roles = []) {
  return function (req, res, next) {
    if (!req.admin) {
      return res.status(401).send("Unauthorized");
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).send("Forbidden");
    }

    return next(); // User authorized, continue
  };}

module.exports = {
  checkForAuthentication,
  restrictTo,
  checkForTeacherAuthentication,
  restrictTeacherTo,
  checkForClassTeacherAuthentication,
  restrictClassTeacherTo,
  checkForParentAuthentication,
  restrictAdminTo,
  checkForAdminAuthentication
}
