/**
 * Created by kinnplh on 2016/10/10.
 */

var mongodb = require('../mongodb');
var Schema = mongodb.mongoose.Schema;

var submitSchema = new Schema({
    time: Date, // 仿真时间
    project: {type: Schema.Types.ObjectId, ref: "project"}, // 所对应的工程
    state: Number, // 当前编译仿真的状态。0表示正在进行编译仿真，1表示成功，2表示失败
    stdMsg: String, // 编译仿真脚本的标准输出
    errMsg: String, // 编译仿真脚本的错误输出
    filePath: String, // 这次仿真对应的文件路径
    inputFile: String, // 这次仿真对应的激励文件
    simulateRes: String, // 这次仿真对应的仿真结果（vcd 文件）

    // 以下四个属性用来绘制波形
    xtime: String, // 仿真时间
    lastlist: Array, // 信号在每一时刻结束时的值
    changelist: Array, //每一时刻发生变化的信号
    signalname: Array, // 信号名称

    type: Number, //  0 or undefined: play submit; 1: homework submit
    score: Number, // 分数 只有 homework 是有意义的
    simulationTime: Number // 这一次仿真的总仿真时长
});

var submit = mongodb.mongoose.model('submit', submitSchema);

module.exports = submit;