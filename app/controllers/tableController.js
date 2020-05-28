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
        }, () => {
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
        }, () => {
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
        }, () => {
            resolve();
        })
    })
}

function updateTableColumns(tableId, columns) {
    return new Promise(resolve => {
        Table.findOneAndUpdate({
            _id: tableId
        }, {
            $set: {
                columns
            }
        }, () => {
            resolve();
        })
    })
}

module.exports = {
    async getTableList(ctx) {
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
    },
    async createTable(ctx) {
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
                    type: 'text',
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
    },
    async removeTable(ctx) {
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
            }, (err) => {
                if (err) {
                    console.log('error:', err);
                }
            })
            removeTable(ctx.request.query.projectId, ctx.request.query.tableId);
            await View.remove({
                _id: {
                    $in: table.views
                }
            }, (err) => {
                if (err) {
                    console.log('error:', err);
                }
            })
            response(ctx);
        } else {
            response(ctx, null, 202, '不存在该资源');
        }
    },
    async renameTable(ctx) {
        upgradeTable(ctx.request.body.id, ctx.request.body.name);
        response(ctx);
    },
    async getTableDetails(ctx) {
        let table = await Table.findOne({
            _id: ctx.request.query.id
        }).exec();
        if (table) {
            table.columns.splice(0, 1);
            response(ctx, table);
        } else {
            response(ctx, null, 201, '不存在该表格');
        }
    },
    async editTableColumns(ctx) {
        let table = await Table.findOne({
            _id: ctx.request.body.id
        }).exec();
        if (table) {
            ctx.request.body.columns.unshift({
                type: 'selection',
                width: 40,
                fixed: true,
            });
            ctx.request.body.columns.forEach(e => {
                if (!e.key) {
                    e.key = gUuid();
                }
            });
            updateTableColumns(ctx.request.body.id, ctx.request.body.columns)
            response(ctx);
        } else {
            response(ctx, null, 201, '不存在该表格');
        }
    },
    async copyTable(ctx) {
        let table = await Table.findOne({
            _id: ctx.request.body.tableId
        }).populate({
            path: 'views',
        }).exec();
        if (table) {
            console.log(table);
            response(ctx);
        } else {
            response(ctx, null, 201, '不存在该表格');
        }
    },
}