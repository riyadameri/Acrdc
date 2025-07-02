const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    client: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: Date,
    status: {
        type: String,
        enum: ['active', 'completed', 'on-hold'],
        default: 'active'
    }
});

module.exports = mongoose.model('Project', ProjectSchema);