// Create a schema for tasks

const mongoose = require('mongoose')


const taskSchema = new mongoose.Schema({
    date: Date,
    callback: {type: String, required: true},
    params: {type: mongoose.Schema.Types.Mixed, required: true}
});

module.exports = mongoose.model('Task', taskSchema)