const express = require("express");
const router = express.Router();
const {
  updateFeedbackToPast,
  deleteFeedback,
  getUpcomingFeedback,
  getPastFeedback,
  createUpcomingFeedback
} = require("../controllers/performanceFeedback");
const {
  createCall,
  getCalls
} = require("../controllers/performanceFeedback");

// Feedback routes
router.post("/feedback/upcoming/", createUpcomingFeedback);
router.post("/feedback/:studentId/:teacherId/", updateFeedbackToPast);

// Call routes
router.post("/calls/", createCall);
router.get("/calls/:studentId/:teacherId", getCalls);

module.exports = router;
