const Router = require('koa-router');
let router = new Router({
    prefix: '/api/groups'
});

const Group = require('../models/group');
const response = require('../utils/response');

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
        await group.save();
        response(ctx);
    })
    // 获取团队列表
    .get('/', async(ctx, next) => {
        
    })

module.exports = router;