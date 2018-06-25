const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let GroupSchema = new mongoose.Schema({
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
    users: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            type: {
                type: String,
                enum: ['creator', 'admin', 'member'],
            }
        },
    ],
    projects: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Project',
        },
    ],
}, {
    versionKey: false
})

module.exports = mongoose.model('Group', GroupSchema);
