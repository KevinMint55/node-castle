/*
 * @ author kevinmint 
 * @ use 统一处理错误中间件
 */

const response = require('../utils/response');
const config = require('../../config');
// 引入jwt认证模块
const jwt = require('jsonwebtoken');
const util = require('util');
const verify = util.promisify(jwt.verify);

module.exports = async(ctx, next) => {
    try {
        // 判断token是否可用
        const token = ctx.header.authorization;
        if (token) {
            try {
                // 解密payload，获取用户名和ID
                let userinfo = await verify(token.split(' ')[1], config.secret);
                ctx.userinfo = userinfo;
                ctx.token = token.split(' ')[1];
            } catch (err) {
                // console.log('认证失败：', err.statusCode);
            }
        }
        await next();
    } catch (err) {
        let status = err.status || 500;
        let message = err.message || '服务器错误';
        switch (status) {
            case 500:
                response(ctx, null, 5000, '服务器错误');
                break;
            case 401:
                response(ctx, null, 4001, '认证失败');
                break;
        }
        ctx.app.emit('error', err, ctx);
    }
}