const Announcement = require("../models/announcementModel")
const admin = require("../utils/firebase");
const Notification = require("../models/notificationModel");
const Teacher = require("../models/teacherModel");
const Parent = require("../models/parentModel");



exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, recipient } = req.body;
    const announcement = new Announcement({ title, content, recipient });
    await announcement.save();

    // Notify the relevant recipients
    if (recipient === "teachers") {
      const teachers = await Teacher.find(); // Fetch all teachers

      for (const teacher of teachers) {
        if (teacher.deviceToken) {
          const message = {
            notification: {
              title: "New Announcement",
              body: `${title}: ${content}`,
            },
            token: teacher.deviceToken,
          };

          try {
            await admin.messaging().send(message);
            console.log(`Notification sent to teacher ${teacher._id}`);
          } catch (error) {
            console.error("Error sending notification to teacher:", error);
          }

          // Save the notification to the database
          const notification = new Notification({
            title: "New Announcement",
            content: `${title}: ${content}`,
            recipient: "teacher",
            teacherId: teacher._id,
          });

          await notification.save();
        }
      }
    } else if (recipient === "parents") {
      const parents = await Parent.find(); // Fetch all parents

      for (const parent of parents) {
        if (parent.deviceToken) {
          const message = {
            notification: {
              title: "New Announcement",
              body: `${title}: ${content}`,
            },
            token: parent.deviceToken,
          };

          try {
            await admin.messaging().send(message);
            console.log(`Notification sent to parent ${parent._id}`);
          } catch (error) {
            console.error("Error sending notification to parent:", error);
          }

          // Save the notification to the database
          const notification = new Notification({
            title: "New Announcement",
            content: `${title}: ${content}`,
            recipient: "parent",
            parentId: parent._id,
          });

          await notification.save();
        }
      }
    }

    res.status(201).json({ message: "Announcement created successfully", announcement });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};


exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.getAnnouncementsByTeacherId = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const announcements = await Announcement.find({ teacherId }).sort({ date: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.getAnnouncementsByParentId = async (req, res) => {
  try {
    const { parentId } = req.params;
    const announcements = await Announcement.find({ parentId }).sort({ date: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.getAnnouncementsByClassTeacherId = async (req, res) => {
  try {
    const { classTeacherId } = req.params;
    const announcements = await Announcement.find({ classTeacherId }).sort({ date: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
