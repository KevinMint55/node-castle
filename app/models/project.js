const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ProjectSchema = new mongoose.Schema({
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
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            type: {
                type: String,
                enum: ['creator', 'admin', 'member'],
            }
        },
    ],
    tables: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Table',
        },
    ],
}, {
    versionKey: false
})

module.exports = mongoose.model('Project', ProjectSchema);
