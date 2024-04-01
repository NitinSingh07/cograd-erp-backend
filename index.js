const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();


const teacherRouter = require("./routes/teacherRoute.js");
const schoolRouter = require("./routes/school.js");
const subjectRouter = require("./routes/subjectRoute.js");
const classRouter = require("./routes/classRoute.js");
const parentRouter = require("./routes/parentRoute.js");
const studentRouter = require("./routes/studentRoute.js");
const classTeacher = require("./routes/classTeacherRoute.js")

const cloudinary = require("cloudinary").v2;

const PORT = process.env.PORT || 4000;
dotenv.config();

cloudinary.config({
  cloud_name: "dc15q9hcp",
  api_key: "661673753759274",
  api_secret: "7LiAj8DOJ2OJ1kZ8fLR4WV-05P8",
});

// app.use(bodyParser.json({ limit: '10mb', extended: true }))
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(express.json());
app.use(cors());
app.use("/teacher", teacherRouter);
app.use("/school", schoolRouter);
app.use("/subject", subjectRouter);
app.use("/class", classRouter);
app.use("/parent", parentRouter);
app.use("/student", studentRouter);
app.use("/classTeacher", classTeacher);
// app.use("/", Routes);

// mongoose
//   .connect("mongodb://localhost:27017/erp-backend")
//   .then(console.log("Connected to MongoDB"))
//   .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log("NOT CONNECTED TO NETWORK", err))

app.listen(PORT, () => {
  console.log(`Server started at port no. ${PORT}`);
});
