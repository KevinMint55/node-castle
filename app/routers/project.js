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

module.exports = router;