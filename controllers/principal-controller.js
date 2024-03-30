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

module.exports = { principalRegister };
