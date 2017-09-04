/**
 * Created by kinnplh on 11/1/16.
 */

var mongodb = require('../mongodb');
var Schema = mongodb.mongoose.Schema;

var homeworkSchema = new Schema({
    hwName: String,
    type: Number,
    topEntityName: String,
    inPortName: Array,
    outPortName: Array,
    deadline: Date,
    filePath: String,
    inputFile: String,
    simulateRes: String,

    //info for judge
    xtime: String,
    lastlist: Array,
    changelist: Array,
    signalname: Array,
    describe: String,

    correspondProject: [{type: Schema.Types.ObjectId, ref:'project'}]

});
var homework = mongodb.mongoose.model('homework', homeworkSchema);

module.exports = homework;