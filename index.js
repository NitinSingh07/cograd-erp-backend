const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cron = require("node-cron");
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
const staffRoutes = require("./routes/staffRoutes");
const driverRoutes = require("./routes/driverRoute");
const adminRoutes = require("./routes/admin");
const complaintRoute = require("./routes/complaintBoxRoute.js");
// const upload = require("./utils/multer.js")
const uploadRoute = require("./routes/documents");
const uploadStudentRoute = require("./routes/studentDocs.js");
const announcementRoutes = require("./routes/announcementRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const taskRoutes = require("./routes/taskRoutes");
const classPeriodRoutes = require("./routes/classPeriodRoutes");
const performanceFeedback = require("./routes/performanceFeedback");

// const cloudinaryUploader = require("./utils/cloudinaryUplaoder.js")

const ClassPeriod = require("./models/classPeriodModel.js");
const Teacher = require("./models/teacherModel.js");
const Timetable = require("./models/timeTableModel.js");

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
const { createClassPeriodsForToday } = require("./controllers/classPeriodController.js");
const cloudinary = require("cloudinary").v2;

const PORT = process.env.PORT || 8080;
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

app.use("/api/parent", parentRouter);
app.use("/api/examResult", resultRouter);
app.use("/api/examList", examListRouter);

// app.use("/sms", smsRouter);
app.use(checkForClassTeacherAuthentication);
app.use(checkForAuthentication);
app.use(checkForTeacherAuthentication);
app.use(checkForParentAuthentication);
app.use(checkForAdminAuthentication);
//student route also contains particular attendance
app.use("/api/student", studentRouter);
app.use("/api/school", schoolRouter);
//for login of class teacher only
app.use("/api/upload", uploadRoute);
app.use("/api/uploadStudent", uploadStudentRoute);
app.use("/api/subject", subjectRouter);
app.use("/api/transaction", schoolTransactionRouter);
app.use("/api/staff", staffRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/class", classRouter);
app.use("/api/admin", adminRouter);
app.use("/api/classTeacher", classTeacher);
//teacherReg route contains registration and attendance, and class teacher registration also restricted by principal
app.use("/api/teacherReg", teacherAttendanceByPrincipalRouter);
app.use("/api/teacherAttendance", teacherAttendanceRouter);
app.use("/api/studentAttendance", studentAttendanceRouter);
//teacher route contains only login , and logout route, teachelist
app.use("/api/teacher", teacherRouter);
app.use("/api/complains", complaintRoute);

app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/tasks", taskRoutes);
app.use("/api/classPeriods", classPeriodRoutes);

app.use("/api/performance", performanceFeedback);

app.get("/api/", (req, res) => {
  res.json({
    success: true,
    message: `Surver is running on PORT ${PORT}`,
  });
});





// Schedule the cron job for testing (every minute)
cron.schedule("* * * * *", () => {
  //console.log("Running cron job to create class periods for today");
  createClassPeriodsForToday();
});

// Alternatively, you can schedule the cron job for production (every day at midnight)
// cron.schedule('0 0 * * *', createClassPeriodsForToday);

app.listen(PORT, () => {
  console.log(`Server started at port no. ${PORT}`);
});
