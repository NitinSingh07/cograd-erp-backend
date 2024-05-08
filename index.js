const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const cookieParser = require("cookie-parser");
const teacherRouter = require("./routes/teacherRoute.js");
const schoolRouter = require("./routes/school.js");
const subjectRouter = require("./routes/subjectRoute.js");
const classRouter = require("./routes/classRoute.js");
const parentRouter = require("./routes/parentRoute.js");
const studentRouter = require("./routes/studentRoute.js");
const classTeacher = require("./routes/classTeacherRoute.js");
const resultRouter = require("./routes/examResultRoute.js");
const examListRouter = require("./routes/examListRoute.js");
const studentAttendanceRouter = require("./routes/studentAttendanceRoutes.js");
const teacherAttendanceByPrincipalRouter = require("./routes/teacherAttendanceByPrincipalRoutes.js");
const teacherAttendanceRouter = require("./routes/teacherAttendanceRouter.js");
const schoolTransactionRouter = require("./routes/schoolTransactionRouter");
const smsRouter = require("./sendSMS.js");
const staffRoutes = require("./routes/staffRoutes");
const {
  checkForAuthentication,
  restrictTo,
  checkForTeacherAuthentication,
  checkForClassTeacherAuthentication,
  restrictTeacherTo,
  checkForParentAuthentication,
} = require("./middleware/auth.js");
const cloudinary = require("cloudinary").v2;

const PORT = process.env.PORT || 4000;
const allowedOrigins = [(origin = "http://localhost:5173")];

app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
    exposedHeaders: ["X-Total-Count"],
  })
);
dotenv.config();

cloudinary.config({
  cloud_name: "dc15q9hcp",
  api_key: "661673753759274",
  api_secret: "7LiAj8DOJ2OJ1kZ8fLR4WV-05P8",
});

// app.use(bodyParser.json({ limit: '10mb', extended: true }))
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(express.json());
// app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
//so ye to hamesha chalega hi chalega
// app.use(checkForAuthentication())-------wrong
//, you're directly calling the function checkForAuthentication() instead of passing it as a middleware function reference.

//this one

app.use("/parent", parentRouter);

app.use("/examResult", resultRouter);
app.use("/examList", examListRouter);

// app.use("/sms", smsRouter);

app.use(checkForAuthentication);
app.use(checkForTeacherAuthentication);
app.use(checkForClassTeacherAuthentication);
app.use(checkForParentAuthentication);
app.use("/studentAttendance", studentAttendanceRouter);
app.use("/student", studentRouter);
app.use("/school", schoolRouter);
//for login of class teacher only
app.use("/classTeacher", classTeacher);
app.use("/subject", restrictTo(["PRINCIPAL"]), subjectRouter);
app.use("/transaction", restrictTo(["PRINCIPAL"]), schoolTransactionRouter);
app.use("/staff", restrictTo(["PRINCIPAL"]), staffRoutes);
app.use("/class", classRouter);
//teacherReg route contains registration and attendance, and class teacher registration also restricted by principal
app.use(
  "/teacherReg",
  restrictTo(["PRINCIPAL"]),
  teacherAttendanceByPrincipalRouter
);
app.use("/teacherAttendance", teacherAttendanceRouter);

//teacher route contains only login , and logout route, teachelist
app.use("/teacher", teacherRouter);
//mongodb collection
mongoose
  .connect(
    "mongodb+srv://varun802vu:2LnAVVkvVm1e7AIr@cluster0.1rercds.mongodb.net/"
  )
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));

// mongoose
// .connect("mongodb://127.0.0.1:27017/cograd-erp")
// .then(console.log("Connected to MongoDB"))
// .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));

// mongoose
// .connect("mongodb://localhost:27017/erp-backend")
// .then(console.log("Connected to MongoDB"))
// .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));

app.listen(PORT, () => {
  console.log(`Server started at port no. ${PORT}`);
});
