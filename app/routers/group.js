const Router = require('koa-router');
let router = new Router({
    prefix: '/api/groups'
});

const Group = require('../models/group');
const User = require('../models/user');
const response = require('../utils/response');

function addGroup(userId, groupId) {
    return new Promise(resolve => {
        User.findOneAndUpdate({
            _id: userId
        }, {
            $push: {
                groups: groupId
            }
        }, (err, res) => {
            resolve();
        })
    })
}

function removeGroup(userId, groupId) {
    return new Promise(resolve => {
        User.findOneAndUpdate({
            _id: userId
        }, {
            $pull: {
                groups: groupId
            }
        }, (err, res) => {
            resolve();
        })
    })
}

function upgradeGroup(groupId, name) {
    return new Promise(resolve => {
        Group.findOneAndUpdate({
            _id: groupId
        }, {
            $set: {
                name
            }
        }, (err, res) => {
            resolve();
        })
    })
}

router
    // 创建团队
    .post('/', async(ctx, next) => {
        if (!ctx.request.body.name) {
            response(ctx, null, 201, '请输入团队名');
            return;
        }
        const data = {
            name: ctx.request.body.name,
            creator: ctx.userinfo._id,
            users: [
                {
                    userId: ctx.userinfo._id,
                    type: 'creator',
                },
            ],
        }
        const group = new Group(data);
        const groupInfo = await group.save();
        addGroup(ctx.userinfo._id, groupInfo._id);
        response(ctx);
    })
    // 获取团队列表
    .get('/', async(ctx, next) => {
        let user = await User.findOne({
            _id: ctx.userinfo._id
        }).populate({
            path: 'groups',
            populate: { path: 'projects' },
        }).exec();
        if (user.groups) {
            response(ctx, user.groups);
        } else {
            response(ctx, []);
        }
    })
    // 删除团队
    .del('/', async(ctx, next) => {
        let group = await Group.findOne({
            _id: ctx.request.query.id
        }, (err) => {
            if (err) {
                console.log("error:" + err)
            }
        })
        if (group) {
            if (ctx.userinfo._id != group.users[0].userId) {
                response(ctx, null, 201, '您无操作权限');
            } else {
                await Group.remove({
                    _id: ctx.request.query.id
                }, (err, res) => {
                    if (err) {
                        console.log('error:', err);
                    }
                })
                removeGroup(ctx.userinfo._id, ctx.request.query.id);
                response(ctx);
            }
        } else {
            response(ctx, null, 202, '不存在该资源');
        }
    })
    // 修改团队名
    .put('/', async(ctx, next) => {
        upgradeGroup(ctx.request.body.id, ctx.request.body.name);
        response(ctx);
    })

module.exports = router;