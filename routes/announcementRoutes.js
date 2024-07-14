const express = require("express");
const router = express.Router();
const { 
  createAnnouncement, 
  getAnnouncementsByTeacherId,
  getAnnouncementsByParentId,
  getAnnouncementsByClassTeacherId, 
  getAllAnnouncements
} = require("../controllers/announcementController");

router.post("/", createAnnouncement);
router.get("/", getAllAnnouncements);

router.get("/teacher/:teacherId", getAnnouncementsByTeacherId);
router.get("/parent/:parentId", getAnnouncementsByParentId);
router.get("/class-teacher/:classTeacherId", getAnnouncementsByClassTeacherId);

module.exports = router;
