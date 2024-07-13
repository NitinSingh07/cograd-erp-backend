const express = require('express');
const ClassPeriod = require('../models/classPeriodModel');

// Create a new class period
exports.createNewPeriod = async (req, res) => {
  try {
    const { tasks, subject, class: className, teacherID, arrangementStatus, arrangementTo, arrangementReason, date } = req.body;

    // Check if the date is a Sunday
    const periodDate = new Date(date);
    if (periodDate.getDay() === 0) {
      return res.status(400).json({ message: 'Class periods cannot be scheduled on Sundays' });
    }

    const classPeriod = new ClassPeriod({ tasks, subject, class: className, teacherID, arrangementStatus, arrangementTo, arrangementReason, date });
    await classPeriod.save();
    res.status(201).json({ message: 'Class Period created successfully', classPeriod });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Get all class periods
exports.getAllPeriods = async (req, res) => {
  try {
    const classPeriods = await ClassPeriod.find().sort({ date: -1 });
    res.status(200).json(classPeriods);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Get class periods by teacher and day
exports.getPeriodByTeacherAndDay = async (req, res) => {
  try {
    const { teacherID, date } = req.query;
    
    if (!teacherID || !date) {
      return res.status(400).json({ message: 'TeacherID and date are required' });
    }

    const periodDate = new Date(date);
    const startOfDay = new Date(periodDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(periodDate.setHours(23, 59, 59, 999));

    const classPeriods = await ClassPeriod.find({
      teacherID,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ date: -1 });

    res.status(200).json(classPeriods);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Update a class period
exports.updatePeriod = async (req, res) => {
  try {
    const classPeriod = await ClassPeriod.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(classPeriod);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Delete a class period
exports.deletePeriod = async (req, res) => {
  try {
    await ClassPeriod.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Class Period deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

