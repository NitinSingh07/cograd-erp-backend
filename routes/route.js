const router = require('express').Router()

const { principalRegister, principalLogIn ,getPrincipalDetail } = require("../controllers/principal-controller")
router.get("/", (req, res) => {
    console.log("response sent");
    res.send("response done")
})
router.post('/principalRegister', principalRegister);
router.post('/principalLogin', principalLogIn);
router.get("/principal/:id", getPrincipalDetail);
module.exports = router;