const Notification = require("../models/notificationModel");

exports.createNotification = async (req, res) => {
  try {
    const { title, content, recipient } = req.body;
    const notification = new Notification({ title, content, recipient });
    await notification.save();
    res.status(201).json({ message: "Notification created successfully", notification });
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


