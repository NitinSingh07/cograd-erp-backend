const express = require('express');
const Task = require('../models/taskModel');

// Create a new task
exports.createNewTask = async (req, res) => {
  try {
    const { title, class: className, subject,  teacherID, date, periodID, deadline } = req.body;
    const task = new Task({ title, class: className, subject,  teacherID, date, periodID, deadline });
    await task.save();
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Get all tasks
exports.getAllTasks= async (req, res) => {
  try {
    const tasks = await Task.find().sort({ date: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Get tasks by period
exports.getTaskByPeriod = async (req, res) => {
  try {
    const { periodId } = req.params;

    const tasks = await Task.find({ periodId });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Update a task
exports.updateTask= async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

// Delete a task
exports.deleteTask =  async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};
