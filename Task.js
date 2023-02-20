// Create a schema for tasks

const mongoose = require('mongoose')


const taskSchema = new mongoose.Schema({
    date: Date,
    callback: String,
    params: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('Task', taskSchema)