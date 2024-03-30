const router = require('express').Router()

router.get("/",(req,res)=>{
    console.log("response sent");
    res.send("response done")
})

module.exports = router;