const bcrypt = require('bcrypt');
const PrincipalModel = require('../models/principalSchema.js'); // Rename import to avoid conflict

const principalRegister = async (req, res) => {
    try {
        const principal = new PrincipalModel({ // Instantiate as an object
            ...req.body
        });

        const existingPrincipalByEmail = await PrincipalModel.findOne({ email: req.body.email });
        const existingSchool = await PrincipalModel.findOne({ schoolName: req.body.schoolName });

        if (existingPrincipalByEmail) {
            res.send({ message: 'Email already exists' });
        }
        else if (existingSchool) {
            res.send({ message: 'School name already exists' });
        }
        else {
            let result = await principal.save(); // Use the instantiated object for saving
            result.password = undefined;
            res.send(result);
        }
    } catch (err) {
        res.status(500).json(err);
    }
};
const principalLogIn = async (req, res) => {
    if (req.body.email && req.body.password) {
        let principal = await PrincipalModel.findOne({ email: req.body.email });
        if (principal) {
            if (req.body.password === principal.password) {
                principal.password = undefined;
                res.send(principal);
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
const getPrincipalDetail = async (req, res) => {
    try {
        let principal = await PrincipalModel.findById(req.params.id);
        if (principal) {
            principal.password = undefined;
            res.send(principal);
        }
        else {
            res.send({ message: "No Principal found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { principalRegister, principalLogIn, getPrincipalDetail };
