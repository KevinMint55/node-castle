// 配置项
const config = require('../../config');

// 发送邮件
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
});

// 例
// let mailOptions = {
//     from: '"kevinmint" <kevinmint@foxmail.com>',
//     to: 'wuwei@dianmi365.com',
//     subject: 'Hello',
//     html: '<b>Hello world....呵呵哒</b><i>喵~~~~</i>',
//     attachments: [{
//             filename: 'package.json',
//             path: './package.json'
//         },
//         {
//             filename: 'content',
//             content: '发送内容'
//         }
//     ]
// };

// transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//         return console.log(error);
//     }
//     console.log('Message sent: %s', info.messageId);
// });

module.exports = transporter