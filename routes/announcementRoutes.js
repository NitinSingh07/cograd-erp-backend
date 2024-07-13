const express = require("express");
const router = express.Router();
const { createAnnouncement, getAllAnnouncements } = require("../controllers/announcementController");

router.post("/", createAnnouncement);
router.get("/", getAllAnnouncements);

module.exports = router;
