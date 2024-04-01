const bcrypt = require('bcrypt');
const StudentModel = require('../models/studentSchema.js'); // Rename import to avoid conflict

const studentRegister = async (req, res) => {
    const { name, email, password, role, schoolName } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const student = new StudentModel({
            name,
            email,
            password: hashedPass,
            role,
            schoolName, // corrected from 'school'
        });

        const existingStudentByEmail = await StudentModel.findOne({ email });
        const existingSchool = await StudentModel.findOne({ schoolName });

        // Validate email domain
        const emailDomain = email.split('@')[1];
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
    const { email, password } = req.body;
    try {
        const student = await StudentModel.findOne({ email });
        if (student) {
            const passwordMatch = await bcrypt.compare(password, student.password);
            if (passwordMatch) {
                student.password = undefined;
                res.send(student);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "User not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudentDetail = async (req, res) => {
    try {
        const student = await StudentModel.findById(req.params.id);
        if (student) {
            student.password = undefined;
            res.send(student);
        } else {
            res.status(404).send({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};


module.exports = { studentRegister, studentLogIn, getStudentDetail };