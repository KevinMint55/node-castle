const Router = require('koa-router');
let router = new Router({
    prefix: '/api/tables'
});

const uuid = require('node-uuid');
const Table = require('../models/table');
const Project = require('../models/project');
const View = require('../models/view');
const response = require('../utils/response');

function gUuid() {
    let uid = uuid.v4();
    uid = uid.replace(/\-/g, '');
    return uid;
}

function addTable(projectId, tableId) {
    return new Promise(resolve => {
        Project.findOneAndUpdate({
            _id: projectId
        }, {
            $push: {
                tables: tableId
            }
        }, (err, res) => {
            resolve();
        })
    })
}

function removeTable(projectId, tableId) {
    return new Promise(resolve => {
        Project.findOneAndUpdate({
            _id: projectId
        }, {
            $pull: {
                tables: tableId
            }
        }, (err, res) => {
            resolve();
        })
    })
}

function upgradeTable(tableId, name) {
    return new Promise(resolve => {
        Table.findOneAndUpdate({
            _id: tableId
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
    // 获取表格列表
    .get('/', async (ctx, next) => {
        let project = await Project.findOne({
            _id: ctx.request.query.projectId
        }).populate({
            path: 'tables',
            populate: {
                path: 'views'
            },
        }).exec();
        if (project.tables) {
            response(ctx, project.tables);
        } else {
            response(ctx, []);
        }
    })
    // 创建表格
    .post('/', async (ctx, next) => {
        const data = {
            name: ctx.request.body.name,
            creator: ctx.userinfo._id,
            users: [{
                user: ctx.userinfo._id,
                type: 'creator',
            }],
            projectId: ctx.request.body.projectId,
            columns: [{
                    type: 'selection',
                    width: 40,
                    fixed: true,
                },
                {
                    title: '标题',
                    key: gUuid(),
                },
                {
                    title: '日期',
                    key: gUuid(),
                    type: 'date',
                },
                {
                    title: '总数',
                    key: gUuid(),
                    type: 'number',
                },
                {
                    title: '类型',
                    key: gUuid(),
                    type: 'select',
                    options: [{
                            value: '类型一',
                            label: '类型一',
                        },
                        {
                            value: '类型二',
                            label: '类型二',
                        },
                        {
                            value: '类型三',
                            label: '类型三',
                        },
                    ],
                },
                {
                    title: '月份',
                    key: gUuid(),
                    type: 'month',
                },
            ],
        }
        const table = new Table(data);
        const tableInfo = await table.save();
        addTable(ctx.request.body.projectId, tableInfo._id);
        response(ctx);
    })
    // 删除表格
    .del('/', async (ctx, next) => {
        let table = await Table.findOne({
            _id: ctx.request.query.tableId
        }, (err) => {
            if (err) {
                console.log("error:" + err)
            }
        })
        if (table) {
            await Table.remove({
                _id: ctx.request.query.tableId
            }, (err, res) => {
                if (err) {
                    console.log('error:', err);
                }
            })
            removeTable(ctx.request.query.projectId, ctx.request.query.tableId);
            await View.remove({
                _id: {
                    $in: table.views
                }
            }, (err, res) => {
                if (err) {
                    console.log('error:', err);
                }
            })
            response(ctx);
        } else {
            response(ctx, null, 202, '不存在该资源');
        }
    })
    // 修改表格名
    .put('/', async (ctx, next) => {
        upgradeTable(ctx.request.body.id, ctx.request.body.name);
        response(ctx);
    })

module.exports = router;