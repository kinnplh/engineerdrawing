/**
 * Created by kinnplh on 2016/10/9.
 */
var mongodb = require('../mongodb');
var Schema = mongodb.mongoose.Schema;
var userSchema = new Schema({
    userName: String,
    password: String,
    msgBox: [{type: Schema.Types.ObjectId, ref:'message'}],
    projectBox: [{type: Schema.Types.ObjectId, ref:'project'}],
    authority: Number,
    group: String,
    homeworkBox: [{type: Schema.Types.ObjectId, ref:'project'}]
});
var user = mongodb.mongoose.model('user', userSchema);

module.exports = user;