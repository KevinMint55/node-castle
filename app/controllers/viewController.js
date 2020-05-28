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
        }, () => {
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
        }, () => {
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
        }, () => {
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
        }, () => {
            resolve();
        })
    })
}

module.exports = {
    async getView(ctx) {
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
    },
    async createView(ctx) {
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
    },
    async removeView(ctx) {
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
            }, (err) => {
                if (err) {
                    console.log('error:', err);
                }
            })
            removeView(ctx.request.query.tableId, ctx.request.query.viewId);
            response(ctx);
        } else {
            response(ctx, null, 202, '不存在该资源');
        }
    },
    async renameView(ctx) {
        upgradeView(ctx.request.body.id, ctx.request.body.name);
        response(ctx);
    },
    async updateViewData(ctx) {
        if (ctx.request.body.content) {
            updateViewData(ctx.request.body.viewId, ctx.request.body.content);
        }
        response(ctx);
    }
}