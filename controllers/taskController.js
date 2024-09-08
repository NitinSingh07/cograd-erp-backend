const express = require("express");
const Task = require("../models/taskModel");

exports.createNewTask = async (req, res) => {
  try {
    const { classID, subjectID, syllabus, chapterName, schoolId } = req.body;

    // Ensure syllabus is provided and is an object
    if (!syllabus || typeof syllabus !== 'object') {
      return res.status(400).json({ message: "Invalid syllabus format" });
    }

    const tasks = [];

    // Iterate through each day in the syllabus
    for (const [day, work] of Object.entries(syllabus)) {
      // Process Class Work
      if (work["Class Work"].length > 0) {
        tasks.push({
          title: { "Class Work": work["Class Work"] },
          class: classID,
          subject: subjectID,
          chapter: chapterName,
          day: day,
        });
      }

      // Process Home Work
      if (work["Home Work"].length > 0) {
        tasks.push({
          title: { "Home Work": work["Home Work"] },
          class: classID,
          subject: subjectID,
          chapter: chapterName,
          day: day,
        });
      }
    }

    // Check for existing tasks to prevent duplication
    for (const task of tasks) {
      const existingTask = await Task.findOne({
        class: task.class,
        subject: task.subject,
        chapter: task.chapter,
        day: task.day,
        title: task.title
      });

      if (existingTask) {
        return res.status(400).json({ message: `Task for ${task.day} already exists` });
      }
    }

    // Create tasks in the database
    await Task.insertMany(tasks);

    res.status(200).json({ message: "Tasks created successfully", tasks });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ date: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Get tasks by period
exports.getTaskByPeriod = async (req, res) => {
  try {
    const { periodId } = req.params;

    const tasks = await Task.find({ periodId });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};


// Get tasks by classID and subjectID
exports.getTasksByClassAndSubject = async (req, res) => {
  try {
    const { classID, subjectID } = req.params;

    // Find tasks that match both classID and subjectID
    const tasks = await Task.find({ class: classID, subject: subjectID });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
