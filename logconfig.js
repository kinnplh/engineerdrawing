/**
 * Created by claud on 2016/10/30.
 */

var winston = require('winston');
// var winstonNodeMailer = require("winston-nodemailer");
// var nodemailer = require('nodemailer');

var logger = new winston.Logger({
    level: 'silly',
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({filename:'always.log'})
    ]
});

// logger.add(winstonNodeMailer, {
//     from: 'koocor@qq.com', // sender address
//     to: ["zhou-xd13@mails.tsinghua.edu.cn"], // list of receivers
//     subject: 'testing ✔', // Subject line
//     level: 'warning',
//     transport: nodemailer.createTransport({
//         service: 'Qq',
//         auth: {
//             user: 'koocor@qq.com',
//             pass: 'idnlfyrzfaflbeih'
//         }
//     })
// });

module.exports = logger;