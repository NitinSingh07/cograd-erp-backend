const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const cookieParser = require("cookie-parser");
const teacherRouter = require("./routes/teacherRoute.js");
const schoolRouter = require("./routes/school.js");
const adminRouter = require("./routes/admin.js");
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
const driverRoutes = require("./routes/driverRoute");
const adminRoutes = require("./routes/admin");
const complaintRoute = require("./routes/complaintBoxRoute.js");
// const upload = require("./utils/multer.js")

// const cloudinaryUploader = require("./utils/cloudinaryUplaoder.js")

const {
  checkForAuthentication,
  restrictTo,
  checkForTeacherAuthentication,
  checkForClassTeacherAuthentication,
  restrictTeacherTo,
  checkForParentAuthentication,
  checkForAdminAuthentication,
  restrictClassTeacherTo,
} = require("./middleware/auth.js");
const cloudinary = require("cloudinary").v2;

const PORT = process.env.PORT || 4000;
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://erp-frontend-eta.vercel.app",
];

mongoose
  .connect(
    "mongodb+srv://varun802vu:2LnAVVkvVm1e7AIr@cluster0.1rercds.mongodb.net/"
  )

  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));

app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
    exposedHeaders: ["X-Total-Count"],
    optionSuccessStatus: 200,
  })
);

dotenv.config();

cloudinary.config({
  cloud_name: "dc15q9hcp",
  api_key: "661673753759274",
  api_secret: "7LiAj8DOJ2OJ1kZ8fLR4WV-05P8",
});

app.use(express.json());
// app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// app.post("/uploadAudio", upload, async (req, res) => {
//   // check for any file validation errors from multer
//   if (req.fileValidationError) {
//     return res
//       .status(400)
//       .json({ message: `File validation error: ${req.fileValidationError}` });
//   }

//   //   invoke the uplader function to handle the upload to cloudinary

//   //   we are passing the req, and res to cloudinaryUploader function
//   const audioResponse = await cloudinaryUploader(req, res);

//   //   send response with audio response from cloudinary

//   return res.status(200).json({ audioResponse: audioResponse.secure_url });
// });

app.use("/parent", parentRouter);

app.use("/examResult", resultRouter);
app.use("/examList", examListRouter);

// app.use("/sms", smsRouter);
app.use(checkForClassTeacherAuthentication);
app.use(checkForAuthentication);
app.use(checkForTeacherAuthentication);
app.use(checkForParentAuthentication);
app.use(checkForAdminAuthentication);
//student route also contains particular attendance
app.use("/student", studentRouter);
app.use("/school", schoolRouter);
//for login of class teacher only

app.use("/subject", subjectRouter);
app.use("/transaction", restrictTo(["PRINCIPAL"]), schoolTransactionRouter);
app.use("/staff", restrictTo(["PRINCIPAL"]), staffRoutes);
app.use("/driver", driverRoutes);
app.use("/class", classRouter);
app.use("/admin", adminRouter);
app.use("/classTeacher", classTeacher);
//teacherReg route contains registration and attendance, and class teacher registration also restricted by principal
app.use("/teacherReg", teacherAttendanceByPrincipalRouter);
app.use("/teacherAttendance", teacherAttendanceRouter);
app.use(
  "/studentAttendance",
  restrictClassTeacherTo(["CLASS-TEACHER"]),
  studentAttendanceRouter
);
//teacher route contains only login , and logout route, teachelist
app.use("/teacher", teacherRouter);
app.use("/complains", complaintRoute);

app.listen(PORT, () => {
  console.log(`Server started at port no. ${PORT}`);
});
