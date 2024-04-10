const { getSchool } = require("../service/schoolAuth");

//Authentication
function checkForAuthentication(req, res, next) {
   
    const tokenCookie = req.cookies?.token;
    req.user = null;

    if (!tokenCookie )
        return next();

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
        if (!req.user)
            return res.redirect("/login")

        if (!roles.includes(req.user.role))
            return res.end("UnAuthorized")

        return next();
    }

}


module.exports = {
    checkForAuthentication,
    restrictTo
};
