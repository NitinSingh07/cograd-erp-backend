const bcrypt = require("bcryptjs");
const Teacher = require("../models/teacherModel");
const { setTeacher } = require("../service/teacherAuth");

// Teacher Registration
const teacherRegister = async (req, res) => {
    const { name, email, password, school, teachSubjects } = req.body;

    try {
        if (!name || !email || !password || !school || !teachSubjects) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ message: "Email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const teacher = new Teacher({
            name,
            email,
            school,
            teachSubjects,
            password: hashedPassword,
        });

        const savedTeacher = await teacher.save();
        const token = setTeacher(savedTeacher);
        res.cookie("teacherToken", token); // Storing teacher token in cookies

        // Removing sensitive data from the response
        savedTeacher.password = undefined;
        return res.status(201).json(savedTeacher);
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

// Teacher Login
const teacherLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found." });
        }

        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password." });
        }

        const token = setTeacher(teacher);
        res.cookie("teacherToken", token);

        teacher.password = undefined;
        return res.status(200).json(teacher);
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = {
    teacherRegister,
    teacherLogin,
};
