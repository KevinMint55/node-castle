const Router = require('koa-router');
let router = new Router({
    prefix: '/api/groups'
});

const Group = require('../models/group');
const Project = require('../models/project');
const Table = require('../models/table');
const View = require('../models/view');
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

function addUser(groupId, user) {
    return new Promise(resolve => {
        Group.findOneAndUpdate({
            _id: groupId
        }, {
            $push: {
                users: user
            }
        }, (err, res) => {
            resolve();
        })
    })
}

function removeUser(groupId, userId) {
    return new Promise(resolve => {
        Group.findOneAndUpdate({
            _id: groupId
        }, {
            $pull: {
                users: {
                    user: userId
                }
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
                    user: ctx.userinfo._id,
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
            if (ctx.userinfo._id != group.users[0].user) {
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
                await Project.remove({
                    _id: {
                        $in: group.projects
                    }
                })
                await Table.remove({
                    projectId: {
                        $in: group.projects
                    }
                })
                await View.remove({
                    projectId: {
                        $in: group.projects
                    }
                })
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
    // 获取团队详情
    .get('/details', async(ctx, next) => {
        let group = await Group.findOne({
            _id: ctx.request.query.groupId
        }).populate({
            path: 'users.user',
        }).exec();
        if (group) {
            response(ctx, group);
        } else {
            response(ctx, null, 201, '不存在该团队');
        }
    })
    // 邀请加入团队
    .post('/invite', async(ctx, next) => {
        let user = await User.findOne({
            username: ctx.request.body.username
        }).exec();
        if (user) {
            if (user.groups.some(item => item == ctx.request.body.groupId)) {
                response(ctx, null, 202, '该用户已在团队中');
            } else {
                addGroup(user._id, ctx.request.body.groupId);
                let userObj = {
                    user: user._id,
                    type: 'member',
                }
                addUser(ctx.request.body.groupId, userObj);
                response(ctx);
            }
        } else {
            response(ctx, null, 201, '不存在该用户');
        }
    })
    // 离开团队
    .del('/leave', async(ctx, next) => {
        let group = await Group.findOne({
            _id: ctx.request.query.id
        }, (err) => {
            if (err) {
                console.log("error:" + err)
            }
        })
        if (group) {
            removeGroup(ctx.userinfo._id, ctx.request.query.id);
            removeUser(ctx.request.query.id, ctx.userinfo._id);
            response(ctx);
        } else {
            response(ctx, null, 202, '不存在该资源');
        }
    })

module.exports = router;