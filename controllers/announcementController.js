const Announcement = require("../models/announcementModel");

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, recipient } = req.body;
    const announcement = new Announcement({ title, content, recipient });
    await announcement.save();
    res.status(201).json({ message: "Announcement created successfully", announcement });
  } catch (error) {
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
