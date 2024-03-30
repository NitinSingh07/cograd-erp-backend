const express = require("express")
const app = express();
app.get(('/'),(req,res)=>{
    return res.send("hello from home page")
})


app.listen(8000,()=>console.log("server started at 8000"))