const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ViewSchema = new mongoose.Schema({
    name: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
    },
    table: {
        type: Schema.Types.ObjectId,
        ref: 'Table',
    },
    data: {
        type: Array,
    },
}, {
    versionKey: false
})

module.exports = mongoose.model('View', ViewSchema);
