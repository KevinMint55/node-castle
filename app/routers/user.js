const Router = require('koa-router');
let router = new Router({
    prefix: '/api/user'
});

const User = require('../controllers/userController');

router
    // 用户登录
    .post('/login', User.login)
    // 添加新用户
    .post('/register', User.register)
    // 根据id移除用户信息
    .del('/', User.removeUserinfo)
    // 根据id修改用户信息
    .put('/', User.updateUserinfo)
    // 修改密码
    .put('/password', User.updatePassword)

module.exports = router;