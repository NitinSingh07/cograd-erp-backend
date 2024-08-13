const Announcement = require("../models/announcementModel")


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
