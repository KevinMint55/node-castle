/*
 * @ author kevinmint 
 * @ use 统一处理返回数据格式
 */

module.exports = async(ctx, data = null, status = 200, message = '成功') => {
    return ctx.response.body = {
        status,
        message,
        data
    }
}