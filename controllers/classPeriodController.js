const express = require("express");
const ClassPeriod = require("../models/classPeriodModel");
const Timetable = require("../models/timeTableModel");
const Teacher = require("../models/teacherModel");
const ClassSubjectProgress = require("../models/ClassSubjectProgress");
const Task = require("../models/taskModel");

const holidays = [
  "2024-08-15",
  "2024-12-25",
  // Add more holidays here
];

// Create or update a timetable entry
exports.createTimeTable = async (req, res) => {
  const { classId, subjectId, teacherId, timePeriod, day } = req.body;

  try {
    // Find and update existing entry, or create a new entry if it doesn't exist
    const updatedEntry = await Timetable.findOneAndUpdate(
      { classId, day, timePeriod }, // Search criteria
      { subjectId, teacherId }, // Update fields
      { new: true, upsert: true } // Return the updated document and create if not exists
    );

    res.status(200).json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get timetable by class ID
exports.getTimetableByClass = async (req, res) => {
  const { classId } = req.params;

  try {
    const timetable = await Timetable.find({ classId })
      .populate("classId")
      .populate("subjectId")
      .populate("teacherId")
      .exec();

    console.log(timetable);

    if (!timetable || timetable.length === 0) {
      return res
        .status(404)
        .json({ message: "Timetable not found for this class" });
    }

    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get timetable by teacher ID
exports.getTimetableByTeacher = async (req, res) => {
  const { teacherId } = req.params;

  try {
    const timetable = await Timetable.find({ teacherId })
      .populate("classId")
      .populate("subjectId")
      .populate("teacherId")
      .exec();

    if (!timetable || timetable.length === 0) {
      return res
        .status(404)
        .json({ message: "Timetable not found for this teacher" });
    }

    res.status(200).json(timetable);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Create a new class period through corn
exports.createClassPeriodsForToday = async () => {
  const today = new Date().toISOString().split("T")[0];
  const currentDay = new Date().toLocaleString("en-US", { weekday: "long" });

  // Check if today is a Sunday or a holiday
  if (currentDay === "Sunday" || holidays.includes(today)) {
    console.log(
      "Today is a holiday or Sunday. No class periods will be created."
    );
    return;
  }

  try {
    // Get all timetables for today
    const timetables = await Timetable.find({ day: currentDay })
      .populate("classId")
      .populate("subjectId")
      .populate("teacherId")
      .exec();

    for (const timetable of timetables) {
      // Check if a class period already exists for today
      const existingClassPeriod = await ClassPeriod.findOne({
        subject: timetable.timePeriod !== "X" ? timetable.subjectId._id : null,
        class: timetable.classId._id,
        teacherID: timetable.teacherId._id,
        date: today,
      });

      if (!existingClassPeriod && timetable.timePeriod !== "X") {
        // Retrieve or initialize progress for the current class and subject
        let progress = await ClassSubjectProgress.findOne({
          class: timetable.classId._id,
          subject: timetable.subjectId._id,
        });

        // Get tasks for the current chapter and day in the current chapter
        const tasksForToday = await Task.find({
          class: timetable.classId._id,
          subject: timetable.subjectId._id,
          chapter: progress ? progress.currentChapter : 1,
          day: `Day ${progress ? progress.currentDayInChapter : 1}`,
        });

        // Check for any incomplete tasks from previous days
        const incompleteTasks = await Task.find({
          class: timetable.classId._id,
          subject: timetable.subjectId._id,
          status: false,
          date: { $lt: new Date(today) },
        });

        // Combine today's tasks with incomplete tasks from previous days
        const combinedTasks = [...tasksForToday, ...incompleteTasks];

        // Only create ClassSubjectProgress and ClassPeriod if there are tasks
        if (combinedTasks.length > 0) {
          if (!progress) {
            progress = new ClassSubjectProgress({
              class: timetable.classId._id,
              subject: timetable.subjectId._id,
              currentChapter: 1,
              currentDayInChapter: 1,
            });
            await progress.save();
          }

          const classPeriod = new ClassPeriod({
            subject: timetable.subjectId._id,
            class: timetable.classId._id,
            teacherID: timetable.teacherId._id,
            date: today,
            timePeriod: timetable.timePeriod,
            day: currentDay,
            tasks: combinedTasks.map((task) => task._id),
          });

          await classPeriod.save();

          // Advance to the next day in the chapter or move to the next chapter
          await updateProgress(progress);

          console.log("Class periods created for today");
        } else {
          const classPeriod = new ClassPeriod({
            subject: timetable.subjectId._id,
            class: timetable.classId._id,
            teacherID: timetable.teacherId._id,
            date: today,
            timePeriod: timetable.timePeriod,
            day: currentDay,
          });

          await classPeriod.save();
          console.log("Class periods created for today");
          console.log(
            `No tasks found for ${timetable.subjectId._id} in class ${timetable.classId._id}`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error creating class periods:", error);
  }
};

// Function to update chapter and day progress
async function updateProgress(progress) {
  const totalDaysInCurrentChapter = await Task.countDocuments({
    class: progress.class,
    subject: progress.subject,
    chapter: progress.currentChapter,
    day: { $regex: /^Day \d+$/ },
  });

  // If more days exist in the current chapter, move to the next day
  if (progress.currentDayInChapter < totalDaysInCurrentChapter) {
    progress.currentDayInChapter++;
  } else {
    // Otherwise, move to the next chapter and reset the day to 1
    progress.currentChapter++;
    progress.currentDayInChapter = 1;
  }

  // Save the updated progress
  await progress.save();
}

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

exports.getClassPeriodProgress = async (req, res) => {
  const { schoolId } = req.params;
  const { date } = req.query;

  try {
    // Parse the date and set the start and end of the day
    const parsedDate = new Date(date);
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch the teachers for the given school
    const teachers = await Teacher.find({ school: schoolId }).select("_id");
    const teacherIds = teachers.map((teacher) => teacher._id);

    // Fetch class periods for the given school and date
    const classPeriods = await ClassPeriod.find({
      teacherID: { $in: teacherIds },
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("tasks")
      .populate("teacherID")
      .exec();

    // Initialize progress data
    const progressData = {};

    // Step 1: Calculate total tasks and completed tasks
    classPeriods.forEach((period) => {
      const teacherId = period.teacherID._id.toString();

      // Initialize teacher data if not already present
      if (!progressData[teacherId]) {
        progressData[teacherId] = {
          teacher: period.teacherID,
          totalTasks: 0,
          completedTasks: 0,
        };
      }

      const totalTasksInPeriod = period.tasks.length;
      let completedTasksInPeriod = 0;

      // Count completed tasks
      period.tasks.forEach((task) => {
        if (task.status === true) {
          completedTasksInPeriod += 1;
        }
      });

      // Accumulate total and completed tasks
      progressData[teacherId].totalTasks += totalTasksInPeriod;
      progressData[teacherId].completedTasks += completedTasksInPeriod;
    });

    // Step 2: Calculate progress percentage for each teacher
    Object.keys(progressData).forEach((teacherId) => {
      const data = progressData[teacherId];
      if (data.totalTasks > 0) {
        data.progressPercentage =
          (data.completedTasks / data.totalTasks) * 100;
      } else {
        data.progressPercentage = 0; // No tasks assigned
      }
    });

    // Convert progressData object to an array for response
    const result = Object.values(progressData);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching class period progress:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};


// Get class periods by teacher and day
exports.getClassPeriodByTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const { date } = req.query;

  try {
    // Parse the date from the query parameters
    const parsedDate = new Date(date);

    // Set the start and end of the day based on the parsed date
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const classPeriods = await ClassPeriod.find({
      teacherID: teacherId,
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("tasks")
      .populate("subject")
      .populate("class")
      .populate("teacherID")
      .exec();

    console.log(classPeriods);

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

// Update an existing arrangement
exports.createArrangement = async (req, res) => {
  try {
    const {
      subject,
      class: className,
      arrangementTo,
      arrangementReason,
      timePeriod,
      date,
    } = req.body;

    const currentDay = new Date().toLocaleString("en-US", { weekday: "long" });

    // Find the class period to be arranged
    const classPeriod = await ClassPeriod.findOne({
      subject,
      class: className,
      timePeriod,
      date,
    });

    if (!classPeriod) {
      return res.status(404).json({ message: "Class period not found" });
    }

    // Check if the teacher already has a class at the same time on the same day
    const conflictingClassPeriod = await ClassPeriod.findOne({
      teacherID: arrangementTo,
      timePeriod,
      day: currentDay,
      date,
    });
    console.log({
      teacherID: arrangementTo,
      timePeriod,
      day: currentDay,
      date,
    });
    console.log(conflictingClassPeriod);

    if (conflictingClassPeriod) {
      return res.status(409).json({
        message: "The teacher already has a class scheduled at this time.",
        conflict: conflictingClassPeriod,
      });
    }

    // Update the class period with the new arrangement details
    classPeriod.arrangementStatus = true;
    classPeriod.arrangementTo = arrangementTo;
    classPeriod.arrangementReason = arrangementReason;

    await classPeriod.save();

    res.status(200).json(classPeriod);
  } catch (error) {
    res.status(500).json({ message: "Error updating arrangement", error });
  }
};

// Get arrangements by teacher ID for today's date
exports.getArrangementById = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Get today's date at midnight (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get tomorrow's date at midnight (00:00:00)
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Find arrangements for the specific teacher for today
    const arrangements = await ClassPeriod.find({
      arrangementTo: teacherId,
      arrangementStatus: true,
      date: { $gte: today, $lt: tomorrow },
    })
      .populate("tasks")
      .populate("arrangementTo")
      .populate("subject")
      .populate("class")
      .populate("teacherID")
      .exec();

  
      
    if (!arrangements || arrangements.length === 0) {
      return res.status(404).json({
        message:
          "No arrangements found for the given teacher ID on today's date",
      });
    }

    res.status(200).json(arrangements);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving arrangements", error });
  }
};

// Get all arrangements by school ID and optional date
exports.getArrangementsBySchoolId = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { date } = req.query;

    // Find all teachers belonging to the given schoolId
    const teachers = await Teacher.find({ school: schoolId }).select("_id");

    // Extract teacher IDs from the result
    const teacherIds = teachers.map((t) => t._id);

    // Create a filter object for the query
    const filter = {
      arrangementStatus: true,
      $or: [
        { teacherID: { $in: teacherIds } },
        { arrangementTo: { $in: teacherIds } },
      ],
    };

    // If a date is provided, add it to the filter
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(startDate.getDate() + 1);

      filter.date = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const arrangements = await ClassPeriod.find(filter)
      .populate("tasks")
      .populate("arrangementTo")
      .populate("class")
      .populate("subject");

    if (!arrangements || arrangements.length === 0) {
      return res.status(404).json({
        message: "No arrangements found for the given school ID and date",
      });
    }

    res.status(200).json(arrangements);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving arrangements", error });
  }
};

// Get available teachers for a specific time period and date
exports.getAvailableTeachers = async (req, res) => {
  try {
    const { date, timePeriod } = req.query;

    // Get all teachers who have a class at the specified time and date
    const busyTeachers = await ClassPeriod.find({
      date: new Date(date),
      timePeriod: timePeriod,
    }).distinct("teacherID");

    // Find teachers who are not busy
    const availableTeachers = await Teacher.find({
      _id: { $nin: busyTeachers },
    });

    console.log("availableTeachers", availableTeachers);

    res.status(200).json(availableTeachers);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error fetching available teachers", error });
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
