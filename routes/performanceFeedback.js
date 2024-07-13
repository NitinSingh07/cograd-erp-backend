const express = require("express");
const router = express.Router();
const {
  createUpcomingFeedback,
  updateFeedbackToPast,
  deleteFeedback,
  getUpcomingFeedback,
  getPastFeedback
} = require("../controllers/feedbackController");
const {
  createCall,
  getCalls
} = require("../controllers/callController");

// Feedback routes
router.post("/feedback/upcoming/:studentId", createUpcomingFeedback);
router.put("/feedback/:feedbackId/:studentId", updateFeedbackToPast);
router.delete("/feedback/:studentId/:feedbackId", deleteFeedback);
router.get("/feedback/upcoming/:studentId", getUpcomingFeedback);
router.get("/feedback/past/:studentId", getPastFeedback);

// Call routes
router.post("/calls/:studentId", createCall);
router.get("/calls/:studentId", getCalls);

module.exports = router;
