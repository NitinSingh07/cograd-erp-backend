const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    // rollNum: {
    //     type: Number,
    //     required: true
    // },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "Student"
    },
    schoolName: {
        type: String,
        unique: true,
        required: true
    }
    // fathersName: {
    //     type: String,
    //     required: true
    // },
    // mothersName: {
    //     type: String,
    //     required: true
    // },
    // dob: {
    //     type: Date,
    //     required: true
    // },
    // aadharCardNo: {
    //     type: String,
    //     required: true
    // },
    // category: {
    //     type: String,
    //     enum: ['SC', 'OBC', 'ST'],
    //     required: true
    // },
    // religion: {
    //     type: String,
    //     required: true
    // },
    // permanentAddress: {
    //     type: String,
    //     required: true
    // },
    // phoneNumber: {
    //     type: String,
    //     required: true
    // },
    // motherTongue: {
    //     type: String,
    //     required: true
    // },
    // nationality: {
    //     type: String,
    //     required: true
    // },
    // busFacilitiesRequired: {
    //     type: Boolean,
    //     default: false
    // },
    // sex: {
    //     type: String,
    //     enum: ['Male', 'Female'],
    //     required: true
    // },
    // admissionSoughtForClass: {
    //     type: String,
    //     required: true
    // },
    // Add more fields as needed
});

module.exports = mongoose.model("student", studentSchema);