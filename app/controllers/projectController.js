const Group = require('../models/group');
const Project = require('../models/project');
const Table = require('../models/table');
const View = require('../models/view');
const response = require('../utils/response');

function addProject(groupId, projectId) {
    return new Promise(resolve => {
        Group.findOneAndUpdate({
            _id: groupId
        }, {
            $push: {
                projects: projectId
            }
        }, () => {
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
        }, () => {
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
        }, () => {
            resolve();
        })
    })
}

module.exports = {
    async createProject(ctx) {
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
        const project = new Project(data);
        const projectInfo = await project.save();
        addProject(ctx.request.body.groupId, projectInfo._id);
        response(ctx);
    },
    async removeProject(ctx) {
        let project = await Project.findOne({
            _id: ctx.request.query.projectId
        }, (err) => {
            if (err) {
                console.log("error:" + err)
            }
        })
        if (project) {
            if (ctx.userinfo._id != project.users[0].user) {
                response(ctx, null, 201, '您无操作权限');
            } else {
                await Project.remove({
                    _id: ctx.request.query.projectId
                }, (err) => {
                    if (err) {
                        console.log('error:', err);
                    }
                })
                removeProject(ctx.request.query.groupId, ctx.request.query.projectId);
                await Table.remove({
                    projectId: ctx.request.query.projectId,
                })
                await View.remove({
                    projectId: ctx.request.query.projectId,
                })
                response(ctx);
            }
        } else {
            response(ctx, null, 202, '不存在该资源');
        }
    },
    async renameProject(ctx) {
        upgradeProject(ctx.request.body.id, ctx.request.body.name);
        response(ctx);
    }
}