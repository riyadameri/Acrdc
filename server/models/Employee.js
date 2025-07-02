const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    hireDate: {
        type: Date,
        default: Date.now
    },
    contact: {
        email: String,
        phone: String
    },
    active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Employee', EmployeeSchema);