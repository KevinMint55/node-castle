const Router = require('koa-router');
let router = new Router({
    prefix: '/api/views'
});

const View = require('../controllers/viewController');

router
    // 获取视图
    .get('/', View.getView)
    // 创建视图
    .post('/', View.createView)
    // 删除视图
    .del('/', View.removeView)
    // 修改视图名
    .put('/', View.renameView)
    // 更新视图数据
    .post('/data', View.updateViewData)

module.exports = router;