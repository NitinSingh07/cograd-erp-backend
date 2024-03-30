const router = require('express').Router()

const {principalRegister} = require("../controllers/principal-controller")
router.get("/",(req,res)=>{
    console.log("response sent");
    res.send("response done")
})
router.post('/principalReg',principalRegister)
module.exports = router;