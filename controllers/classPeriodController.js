const express = require("express");
const ClassPeriod = require("../models/classPeriodModel");

//create a time table
exports.createTimeTable = async (req, res) => {
  const { classId, subjectId, teacherId, timePeriod, day } = req.body;

  const newEntry = new Timetable({
    classId,
    subjectId,
    teacherId,
    timePeriod,
    day,
  });

  try {
    const savedEntry = await newEntry.save();
    res.status(200).json(savedEntry);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};


// Update a timetable entry
exports.updateTimeTable = async (req, res) => {
  const { id } = req.params;
  const { classId, subjectId, teacherId, timePeriod, day } = req.body;

  try {
    const updatedEntry = await Timetable.findByIdAndUpdate(
      id,
      { classId, subjectId, teacherId, timePeriod, day },
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ message: "Timetable entry not found" });
    }

    res.status(200).json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};



// Create a new class period
exports.createNewPeriod = async (req, res) => {
  try {
    const {
      subject,
      class: className,
      teacherID,
      arrangementStatus,
      arrangementTo,
      arrangementReason,
      date,
    } = req.body;

    // Check if the date is a Sunday
    const periodDate = new Date(date);
    if (periodDate.getDay() === 0) {
      return res
        .status(400)
        .json({ message: "Class periods cannot be scheduled on Sundays" });
    }

    const classPeriod = new ClassPeriod({
      subject,
      class: className,
      teacherID,
      arrangementStatus,
      arrangementTo,
      arrangementReason,
      date,
    });
    await classPeriod.save();
    res
      .status(201)
      .json({ message: "Class Period created successfully", classPeriod });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Get all class periods
exports.getAllPeriods = async (req, res) => {
  try {
    const classPeriods = await ClassPeriod.find().sort({ date: -1 });
    res.status(200).json(classPeriods);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Get class periods by teacher and day
exports.getClassPeriodByTeacher = async (req, res) => {
  const { teacherID } = req.params;

  try {
    // Get the current date
    const currentDate = new Date();
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find class periods by teacher ID and date range
    const classPeriods = await ClassPeriod.find({
      teacherID,
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    res.status(200).json(classPeriods);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving class periods", error });
  }
};

// Update a class period
exports.updatePeriod = async (req, res) => {
  const { periodId } = req.params;
  const updateData = req.body;

  try {
    // Find the class period by ID and update it
    const classPeriod = await ClassPeriod.findByIdAndUpdate(
      periodId,
      updateData,
      {
        new: true,
      }
    );

    // If the class period is not found, return a 404 error
    if (!classPeriod) {
      return res.status(404).json({ message: "Class period not found" });
    }

    // Return the updated class period
    res.status(200).json(classPeriod);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Delete a class period
exports.deletePeriod = async (req, res) => {
  try {
    await ClassPeriod.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Class Period deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Create an arrangement
exports.createArrangement = async (req, res) => {
  try {
    const {
      subject,
      class: className,
      arrangementTo,
      arrangementReason,
      date,
    } = req.body;

    const arrangement = new ClassPeriod({
      subject,
      class: className,
      arrangementStatus: true,
      arrangementTo,
      arrangementReason,
      date,
    });

    await arrangement.save();
    res.status(201).json(arrangement);
  } catch (error) {
    res.status(500).json({ message: "Error creating arrangement", error });
  }
};

// Get arrangements by teacher ID
exports.getArrangementById = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const arrangements = await ClassPeriod.find({
      arrangementTo: teacherId,
      arrangementStatus: true,
    })
      .populate("tasks")
      .populate("arrangementTo");

    if (!arrangements) {
      return res
        .status(404)
        .json({ message: "No arrangements found for the given teacher ID" });
    }

    res.status(200).json(arrangements);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving arrangements", error });
  }
};

// Update an arrangement by teacher ID
exports.updateArrangement = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const {
      photos,
      subject,
      class: className,
      arrangementTo,
      arrangementReason,
      date,
    } = req.body;

    const arrangement = await ClassPeriod.findOneAndUpdate(
      { arrangementTo: teacherId, arrangementStatus: true },
      {
        photos,
        subject,
        class: className,
        arrangementReason,
        date,
      },
      { new: true }
    );

    if (!arrangement) {
      return res
        .status(404)
        .json({ message: "No arrangement found for the given teacher ID" });
    }

    res.status(200).json(arrangement);
  } catch (error) {
    res.status(500).json({ message: "Error updating arrangement", error });
  }
};

// Delete an arrangement by period ID
exports.deleteArrangement = async (req, res) => {
  try {
    const { periodId } = req.params;

    const arrangement = await ClassPeriod.findByIdAndDelete(periodId);

    if (!arrangement) {
      return res
        .status(404)
        .json({ message: "No arrangement found for the given period ID" });
    }

    res.status(200).json({ message: "Arrangement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting arrangement", error });
  }
};
