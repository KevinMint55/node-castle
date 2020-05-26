const Koa = require('koa');
const koaBody = require('koa-body');

// 引入jwt认证模块
const jwtKoa = require('koa-jwt');

// 配置项
const config = require('./config');
// 创建一个Koa对象表示web app本身
const app = new Koa();

// 静态资源
const path = require('path');
const koaStatic = require('koa-static');

// 连接数据库
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${config.database.USER}:${config.database.PASSWORD}@${config.database.URL}`, {
    useNewUrlParser: true
});
mongoose.connection.on('connected', () => {
    console.log('Mongoose connection open to ' + `${config.database.URL}`);
});
mongoose.connection.on('error', (err) => {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose connection disconnected');
});

// 显示日志
const logger = require('koa-logger');
app.use(logger());

// 显示错误信息
const onerror = require('koa-onerror');
onerror(app);

// 获取静态资源
app.use(koaStatic(path.join(__dirname)));

// 允许跨域
app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', '*');
    ctx.set('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
    await next();
});

// 错误处理
app.use(require('./app/middlewares/error'));
app.on('error', function(err, ctx) {
    // 忽略OPTIONS请求错误
    if (ctx.request.method === 'OPTIONS') return;
    console.log('logging error: ', err);
});

// 使用jwtKoa
app.use(jwtKoa({
    secret: config.secret
}).unless({
    path: [/^\/api\/user\/login/, /^\/api\/user\/register/]
}));

// body报表解析
app.use(koaBody({
    multipart: true,
    formLimit: "5mb",
    jsonLimit: "5mb",
    textLimit: "5mb",
}));

// 添加接口表
app.use(require('./app/routers/user').routes())
    .use(require('./app/routers/group').routes())
    .use(require('./app/routers/project').routes())
    .use(require('./app/routers/table').routes())
    .use(require('./app/routers/view').routes())

// socket连接
const server = require('http').Server(app.callback());
const io = require('socket.io')(server, {
    path: '/api/ws'
});

io.on('connection', (socket) => {
    socket.on('updateView', (vId, data) => {
        io.emit('updateView', vId, data, socket.handshake.query.userId);
    })
    socket.on('addViewItem', (vId, obj) => {
        io.emit('addViewItem', vId, obj, socket.handshake.query.userId);
    })
    socket.on('removeViewItem', (vId, key, ids) => {
        io.emit('removeViewItem', vId, key, ids, socket.handshake.query.userId);
    })
    socket.on('updateColumns', (vId) => {
        io.emit('updateColumns', vId);
    })
    socket.on('updateProject', (pId) => {
        io.emit('updateProject', pId);
    })
});

// 在端口config.port监听
server.listen(config.port);

// 在端口config.port监听 
// app.listen(config.port);