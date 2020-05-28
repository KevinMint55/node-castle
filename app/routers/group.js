const Router = require('koa-router');
let router = new Router({
    prefix: '/api/groups'
});

const Group = require('../controllers/groupController');

router
    // 创建团队
    .post('/', Group.createGroup)
    // 获取团队列表
    .get('/', Group.getGroupList)
    // 删除团队
    .del('/', Group.removeGroup)
    // 修改团队名
    .put('/', Group.renameGroup)
    // 获取团队详情
    .get('/details', Group.getGroupDetails)
    // 邀请加入团队
    .post('/invite', Group.inviteGroup)
    // 离开团队
    .del('/leave', Group.leaveGroup)

module.exports = router;