const Router = require('koa-router');
let router = new Router({
    prefix: '/api/projects'
});

const Project = require('../models/project');
const Group = require('../models/group');
const response = require('../utils/response');

function addProject(groupId, projectId) {
    return new Promise(resolve => {
        Group.findOneAndUpdate({
            _id: groupId
        }, {
            $push: {
                projects: projectId
            }
        }, (err, res) => {
            resolve();
        })
    })
}

function removeProject(groupId, projectId) {
    return new Promise(resolve => {
        Group.findOneAndUpdate({
            _id: groupId
        }, {
            $pull: {
                projects: projectId
            }
        }, (err, res) => {
            resolve();
        })
    })
}

function upgradeProject(projectId, name) {
    return new Promise(resolve => {
        Project.findOneAndUpdate({
            _id: projectId
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
    // 创建项目
    .post('/', async (ctx, next) => {
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
        const project = new Project(data);
        const projectInfo = await project.save();
        addProject(ctx.request.body.groupId, projectInfo._id);
        response(ctx);
    })
    // 删除项目
    .del('/', async(ctx, next) => {
        let project = await Project.findOne({
            _id: ctx.request.query.projectId
        }, (err) => {
            if (err) {
                console.log("error:" + err)
            }
        })
        if (project) {
            if (ctx.userinfo._id != project.users[0].userId) {
                response(ctx, null, 201, '您无操作权限');
            } else {
                await Project.remove({
                    _id: ctx.request.query.projectId
                }, (err, res) => {
                    if (err) {
                        console.log('error:', err);
                    }
                })
                removeProject(ctx.request.query.groupId, ctx.request.query.projectId);
                response(ctx);
            }
        } else {
            response(ctx, null, 202, '不存在该资源');
        }
    })
    // 修改项目名
    .put('/', async(ctx, next) => {
        upgradeProject(ctx.request.body.id, ctx.request.body.name);
        response(ctx);
    })

module.exports = router;