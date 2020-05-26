const Router = require('koa-router');
let router = new Router({
    prefix: '/api/user'
});

const User = require('../models/user');
const response = require('../utils/response');

const jwt = require('jsonwebtoken');
const config = require('../../config');
// 加密算法
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;

const Upload = require('../utils/upload.js');

router
    // 用户登录
    .post('/login', async (ctx) => {
        let username = ctx.request.body.username || '',
            password = ctx.request.body.password || '';

        let user = await User.findOne({
            username
        }).exec();
        if (!user) {
            response(ctx, null, 201, '该用户不存在');
        } else {
            let res = await user.comparePassword(password);
            if (res) {
                let data = user.toObject();
                // 签发token
                const token = jwt.sign(data, config.secret, {
                    expiresIn: '7d'
                })
                data.token = token;
                response(ctx, data);
            } else {
                response(ctx, null, 202, '密码错误');
            }
        }
    })
    // 添加新用户
    .post('/register', async (ctx) => {
        let data = {
            username: ctx.request.body.username || '',
            nickname: ctx.request.body.username || '',
            password: ctx.request.body.password || '',
        }
        let exist = await User.findOne({
            username: data.username
        }, (err) => {
            if (err) {
                console.log("error:" + err)
            }
        })
        // 判断是否存在该用户名用户
        if (exist) {
            response(ctx, null, 201, '该用户名已存在');
        } else {
            let user = new User(data);
            let userInfo = await user.save();
            let userInfoData = userInfo.toObject();
            // 签发token
            const token = jwt.sign(userInfoData, config.secret, {
                expiresIn: '7d'
            })
            userInfoData.token = token;
            response(ctx, userInfoData);
        }
    })
    // 根据id移除用户信息
    .del('/', async (ctx) => {
        let exist = await User.findOne({
            _id: ctx.request.query.id
        }, (err) => {
            if (err) {
                console.log("error:" + err)
            }
        })
        if (exist) {
            await User.remove({
                _id: ctx.request.query.id
            }, (err) => {
                if (err) {
                    console.log('error:', err);
                }
            })
            response(ctx);
        } else {
            response(ctx, null, 201, '不存在');
        }
    })
    // 根据id修改用户信息
    .put('/', async (ctx) => {
        if (ctx.request.files.file) {
            const user = await User.findById(ctx.userinfo._id);
            // 上传新头像并删除原头像
            const oldAvatar = user.avatar;
            const data = await Upload.upToLocal(ctx.request.files);
            const qiniu = await Upload.upToQiniu(data.file.filePath, `castle/${ctx.userinfo._id}_${data.file.filename}`);
            Upload.removeImage(data.file.filePath);
            await new Promise(resolve => {
                User.findOneAndUpdate({
                    _id: ctx.userinfo._id
                }, {
                    $set: {
                        avatar: qiniu.key
                    }
                }, async () => {
                    if (oldAvatar !== 'castle/default.png') {
                        const imagesInfo = await Upload.getQiniuImageList(oldAvatar);
                        await Upload.removeQiniuImageList(imagesInfo.items);
                    }
                    resolve();
                })
            })
        }
        await new Promise(resolve => {
            User.findOneAndUpdate({
                _id: ctx.userinfo._id
            }, {
                $set: {
                    nickname: ctx.request.body.nickname || '',
                    updatedAt: Date.now(),
                }
            }, () => {
                resolve();
            })
        })
        let data = await User.findById(ctx.userinfo._id);
        data = data.toObject();
        data.token = ctx.token;
        response(ctx, data);
    })
    // 修改密码
    .put('/password', async (ctx) => {
        let user = await User.findOne({
            _id: ctx.userinfo._id
        }).exec();
        let res = await user.comparePassword(ctx.request.body.oldPwd);
        if (res) {
            let newPwd;
            // 密码加密
            await new Promise((resolve, reject) => {
                bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
                    if (err) reject();
                    bcrypt.hash(ctx.request.body.newPwd, salt, (err, hash) => {
                        if (err) reject();
                        newPwd = hash;
                        resolve();
                    });
                });
            })
            await new Promise(resolve => {
                User.findOneAndUpdate({
                    _id: ctx.userinfo._id
                }, {
                    $set: {
                        password: newPwd
                    }
                }, () => {
                    resolve();
                })
            })
            response(ctx);
        } else {
            response(ctx, null, 201, '原密码错误');
        }
    })

module.exports = router;