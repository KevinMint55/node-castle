const Router = require('koa-router');
let router = new Router({
    prefix: '/api/tables'
});

const Table = require('../controllers/tableController');

router
    // 获取表格列表
    .get('/', Table.getTableList)
    // 创建表格
    .post('/', Table.createTable)
    // 删除表格
    .del('/', Table.removeTable)
    // 修改表格名
    .put('/', Table.renameTable)
    // 获取表格详情
    .get('/details', Table.getTableDetails)
    // 编辑表头
    .post('/columns', Table.editTableColumns)
    // 表格复制
    .post('/copy', Table.copyTable)

module.exports = router;