const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let TableSchema = new mongoose.Schema({
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
    ProjectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
    },
    columns: {
        type: Array,
    },
    views: [
        {
            type: Schema.Types.ObjectId,
            ref: 'View',
        },
    ],
}, {
    versionKey: false
})

module.exports = mongoose.model('Table', TableSchema);
