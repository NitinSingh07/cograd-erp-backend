const bcrypt = require('bcrypt');
const classTeacherModel = require('../models/classTeacherModel'); // Rename import to avoid conflict

const classTeacherRegister = async (req, res) => {
    const { email, password, role, school } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const classTeacher = new classTeacherModel({  
            email,
            password: hashedPass,
            role,
            school,
        });

        const existingClassTeacherByEmail = await classTeacherModel.findOne({ email });
        const existingSchool = await classTeacherModel.findOne({ school });

        // Validate email domain
        const emailDomain = email.split('@')[1];
        const validDomain = emailDomain === 'cograd.in';

        if (existingClassTeacherByEmail) {
            res.send({ message: 'Email already exists' });
        } else if (existingSchool) {
            res.send({ message: 'School name already exists' });
        } else if (!validDomain) {
            res.send({ message: 'Email domain is not valid. It should be @cograd.in' });
        } else {
            let result = await classTeacher.save();
            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};


const classTeacherLogIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        const classTeacher = await classTeacherModel.findOne({ email });
        if (classTeacher) {
            const passwordMatch = await bcrypt.compare(password, classTeacher.password);
            if (passwordMatch) {
                classTeacher.password = undefined;
                res.send(classTeacher);
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

//details by schoolname
const getClassTeacherDetail = async (req, res) => {
    try {
        const schoolName = req.params.school; // Assuming the parameter is the school name
        const classTeacher = await classTeacherModel.findOne({ school: schoolName });
        if (classTeacher) {
            classTeacher.password = undefined;
            res.send(classTeacher);
        } else {
            res.status(404).send({ message: "No classTeacher found for this school" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};



module.exports = {classTeacherRegister, classTeacherLogIn, getClassTeacherDetail};