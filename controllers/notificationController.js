const admin = require("../utils/firebase");
const Notification = require("../models/notificationModel");
const Teacher = require("../models/teacherModel");
const Parent = require("../models/parentModel");


exports.createNotification = async (req, res) => {
  try {
    const { title, content, recipient, teacherId, parentId, classTeacherId } = req.body;

    // Create the notification record
    const notification = new Notification({ title, content, recipient, teacherId, parentId, classTeacherId });
    await notification.save();

    // Send the notification based on the recipient type
    let deviceToken;

    if (recipient === "teacher" && teacherId) {
      const teacher = await Teacher.findById(teacherId);
      deviceToken = teacher.deviceToken;

    } else if (recipient === "parent" && parentId) {
      const parent = await Parent.findById(parentId);
      deviceToken = parent.deviceToken;

    } else if (recipient === "classTeacher" && classTeacherId) {
      const classTeacher = await ClassTeacher.findById(classTeacherId);
      deviceToken = classTeacher.deviceToken;
    }

    if (deviceToken) {
      const message = {
        notification: {
          title: title,
          body: content,
        },
        token: deviceToken,
      };

      try {
        await admin.messaging().send(message);
        console.log(`Notification sent to ${recipient} with ID: ${recipient === "teacher" ? teacherId : recipient === "parent" ? parentId : classTeacherId}`);
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }

    res.status(201).json({ message: "Notification created successfully", notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};


exports.getNotificationByParentId = async (req, res) => {
  const { parentId } = req.params;

  try {
    const notifications = await Notification.find({ recipient: 'parent', parentId }).sort({ date: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.getNotificationByTeacherId = async (req, res) => {
  const { teacherId } = req.params;

  try {
    const notifications = await Notification.find({ recipient: 'teacher', teacherId }).sort({ date: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.getNotificationByClassTeacherId = async (req, res) => {
  const { classTeacherId } = req.params;

  try {
    const notifications = await Notification.find({ recipient: 'class teacher', classTeacherId }).sort({ date: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ date: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
