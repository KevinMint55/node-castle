const Router = require('koa-router');
let router = new Router({
    prefix: '/api/views'
});

const View = require('../models/view');
const Table = require('../models/table');
const response = require('../utils/response');

function addView(tableId, viewId) {
    return new Promise(resolve => {
        Table.findOneAndUpdate({
            _id: tableId
        }, {
            $push: {
                views: viewId
            }
        }, (err, res) => {
            resolve();
        })
    })
}

function removeView(tableId, viewId) {
    return new Promise(resolve => {
        Table.findOneAndUpdate({
            _id: tableId
        }, {
            $pull: {
                views: viewId
            }
        }, (err, res) => {
            resolve();
        })
    })
}

function upgradeView(viewId, name) {
    return new Promise(resolve => {
        View.findOneAndUpdate({
            _id: viewId
        }, {
            $set: {
                name
            }
        }, (err, res) => {
            resolve();
        })
    })
}

function updateViewData(viewId, data) {
    return new Promise(resolve => {
        View.findOneAndUpdate({
            _id: viewId
        }, {
            $set: {
                data
            }
        }, (err, res) => {
            resolve();
        })
    })
}

router
    // 获取视图
    .get('/', async (ctx, next) => {
        let view = await View.findOne({
            _id: ctx.request.query.viewId
        }).populate({
            path: 'table',
        }).exec();
        if (view) {
            response(ctx, view);
        } else {
            response(ctx, null, 202, '该视图不存在');
        }
    })
    // 创建视图
    .post('/', async (ctx, next) => {
        let table = await Table.findOne({
            _id: ctx.request.body.tableId
        }, (err) => {
            if (err) {
                console.log("error:" + err)
            }
        })
        if (table) {
            const data = {
                name: ctx.request.body.name,
                creator: ctx.userinfo._id,
                projectId: table.projectId,
                table: ctx.request.body.tableId,
                data: [],
            }
            const view = new View(data);
            const viewInfo = await view.save();
            addView(ctx.request.body.tableId, viewInfo._id);
            response(ctx);
        } else {
            response(ctx, null, 201, '不存在该表格');
        }
    })
    // 删除视图
    .del('/', async(ctx, next) => {
        let view = await View.findOne({
            _id: ctx.request.query.viewId
        }, (err) => {
            if (err) {
                console.log("error:" + err)
            }
        })
        if (view) {
            await View.remove({
                _id: ctx.request.query.viewId
            }, (err, res) => {
                if (err) {
                    console.log('error:', err);
                }
            })
            removeView(ctx.request.query.tableId, ctx.request.query.viewId);
            response(ctx);
        } else {
            response(ctx, null, 202, '不存在该资源');
        }
    })
    // 修改视图名
    .put('/', async(ctx, next) => {
        upgradeView(ctx.request.body.id, ctx.request.body.name);
        response(ctx);
    })
    // 更新视图数据
    .post('/data', async(ctx, next) => {
        if (ctx.request.body.content) {
            updateViewData(ctx.request.body.viewId, ctx.request.body.content);
        }
        response(ctx);
    })

module.exports = router;