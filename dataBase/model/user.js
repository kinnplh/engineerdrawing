/**
 * Created by kinnplh on 2016/10/9.
 */
var mongodb = require('../mongodb');
var Schema = mongodb.mongoose.Schema;
var userSchema = new Schema({
    userName: String, // 用户名
    password: String, // 密码
    msgBox: [{type: Schema.Types.ObjectId, ref:'message'}], // 信息列表，实际存储的是表"messages"中的某条记录的主键 _id。请参考 mongodb 的文档，来了解什么是表、记录和主键。
    projectBox: [{type: Schema.Types.ObjectId, ref:'project'}],// 项目列表，实际存储的是表"projects"中的某条记录的主键 _id。
    authority: Number, // 用户权限：0表示普通用户，1表示管理员用户
    group: String, // 所属群组，就是一个字符串
    homeworkBox: [{type: Schema.Types.ObjectId, ref:'project'}]// 作业列表，实际存储的是表"projects"中的某条记录的主键 _id。
});
var user = mongodb.mongoose.model('user', userSchema);

module.exports = user;