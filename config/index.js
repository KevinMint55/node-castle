module.exports = {
    port: 8001, // 启动端口
    database: { // 数据库
        USER: '', // 用户名
        PASSWORD: '', // 用户密码
        URL: '' // 数据库地址
    },
    secret: '', // 加密salt
    assetsDir: './assets/', // 生成临时图片位置
    qiniu: { // 七牛云
        accessKey: '',
        secretKey: '',
        scope: '',
    },
}