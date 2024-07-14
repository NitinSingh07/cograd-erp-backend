const Notification = require("../models/notificationModel");

exports.createNotification = async (req, res) => {
  try {
    const { title, content, recipient, teacherId, parentId, classTeacherId } = req.body;
    const notification = new Notification({ title, content, recipient, teacherId, parentId, classTeacherId });
    await notification.save();
    res.status(201).json({ message: "Notification created successfully", notification });
  } catch (error) {
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
