const Router = require('koa-router');
let router = new Router({
    prefix: '/api/projects'
});

const Project = require('../controllers/projectController');

router
    // 创建项目
    .post('/', Project.createProject)
    // 删除项目
    .del('/', Project.removeProject)
    // 修改项目名
    .put('/', Project.renameProject)

module.exports = router;