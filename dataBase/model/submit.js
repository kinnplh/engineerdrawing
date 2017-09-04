/**
 * Created by kinnplh on 2016/10/10.
 */

var mongodb = require('../mongodb');
var Schema = mongodb.mongoose.Schema;

var submitSchema = new Schema({
    time: Date,
    project: {type: Schema.Types.ObjectId, ref: "project"},
    state: Number,
    stdMsg: String,
    errMsg: String,
    filePath: String,
    inputFile: String,
    simulateRes: String,

    xtime: String,
    lastlist: Array,
    changelist: Array,
    signalname: Array,

    type: Number, //  0 or undefined: play submit; 1: homework submit
    score: Number,
    simulationTime: Number
});

var submit = mongodb.mongoose.model('submit', submitSchema);

module.exports = submit;