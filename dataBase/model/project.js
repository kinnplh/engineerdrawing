/**
 * Created by kinnplh on 2016/10/10.
 */

var mongodb = require('../mongodb');
var Schema = mongodb.mongoose.Schema;

var projectSchema = new Schema({
    projectName: String,
    author: {type: Schema.Types.ObjectId, ref: "user"},
    type: Number,
    deleted: Boolean,
    createTime: Date,
    lastModifiedTime: Date,
    filePath: String,
    inputFile: String,
    submitBox: [{type: Schema.Types.ObjectId, ref: 'submit'}],
    compileStatus: Number,
    topEntityName: String,

    homework: {type: Schema.Types.ObjectId, ref: 'homework'},
    score: Number,
    hwSubmitBox: [{type: Schema.Types.ObjectId, ref: 'submit'}],

    input: Array,
    output: Array,

    lastSimulationTime: Number,
    entityPath: String
});

var project = mongodb.mongoose.model('project', projectSchema);

module.exports = project;