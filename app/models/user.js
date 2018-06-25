const mongoose = require('mongoose');
// 加密算法
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;
// 日期格式化
const moment = require('moment');

let UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    }, // 用户名
    nickname: {
        type: String,
        required: true
    }, // 昵称
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    avatar: {
        type: String,
        default: 'default.png'
    },
}, {
    versionKey: false
})

if (!UserSchema.options.toObject)
    UserSchema.options.toObject = {};
// 过滤部分属性用空格隔开
UserSchema.options.toObject.hide = 'password';
UserSchema.options.toObject.momentFormat = 'createdAt updatedAt';
UserSchema.options.toObject.transform = (doc, ret, options) => {
    if (options.hide) {
        options.hide.split(' ').forEach((prop) => {
            delete ret[prop];
        });
    }
    if (options.momentFormat) {
        options.momentFormat.split(' ').forEach((prop) => {
            ret[prop] = moment(ret[prop]).format('YYYY-MM-DD HH:mm:ss');
        });
    }
}

// 设置保存前处理
UserSchema.pre('save', function(next) {
    // 密码加密
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) return next(err);
            this.password = hash;
            next();
        });
    });
})

UserSchema.methods = {
    comparePassword(password) {
        // 加密验证
        return bcrypt.compare(password, this.password);
    }
}

UserSchema.statics = {
    fetch(cb) {
        return this.find({}).sort('createdAt').exec(cb);
    },
    findById(id, cb) {
        return this.findOne({
            _id: id
        }).select('nickname username avatar').exec(cb);
    }
}

module.exports = mongoose.model('User', UserSchema);