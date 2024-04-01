const bcrypt = require('bcrypt');
const StudentModel = require('../models/studentSchema.js'); // Rename import to avoid conflict

const studentRegister = async (req, res) => {
    try {
        const student = new StudentModel({ ...req.body });

        const existingStudentByEmail = await StudentModel.findOne({ email: req.body.email });
        const existingSchool = await StudentModel.findOne({ schoolName: req.body.schoolName });

        // Validate email domain
        const emailDomain = req.body.email.split('@')[1];
        const validDomain = emailDomain === 'cograd.in';

        if (existingStudentByEmail) {
            res.send({ message: 'Email already exists' });
        } else if (existingSchool) {
            res.send({ message: 'School name already exists' });
        } else if (!validDomain) {
            res.send({ message: 'Email domain is not valid. It should be @cograd.in' });
        } else {
            let result = await student.save();
            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const studentLogIn = async (req, res) => {
    if (req.body.email && req.body.password) {
        let student = await StudentModel.findOne({ email: req.body.email });
        if (student) {
            if (req.body.password === student.password) {
                student.password = undefined;
                res.send(student);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "User not found" });
        }
    } else {
        res.send({ message: "Email and password are required" });
    }
};
const getStudentDetail = async (req, res) => {
    try {
        let student = await StudentModel.findById(req.params.id);
        if (student) {
            student.password = undefined;
            res.send(student);
        }
        else {
            res.send({ message: "No Student found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { studentRegister, studentLogIn, getStudentDetail };