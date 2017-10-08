/**
 * Created by kinnplh on 2016/10/10.
 */

var mongodb = require('../mongodb');
var Schema = mongodb.mongoose.Schema;

var projectSchema = new Schema({
    projectName: String, // 项目的名称
    author: {type: Schema.Types.ObjectId, ref: "user"}, // 项目的所有者，实际上是表 users 中某一条记录的主键
    type: Number, // 项目的类型 0：拖拽 1：编辑器 2：CPU
    deleted: Boolean, // 项目是否已经被删除。这个域实际上并没有被用到
    createTime: Date, // 创建的时间
    lastModifiedTime: Date, // 上一次修改的时间。这个域实际上并没有被用到，也就是说，一直等同于创建时间
    filePath: String, // 文件路径 表示该项目的文件被具体存储在了哪个地方
    inputFile: String, // 输入激励文件名
    submitBox: [{type: Schema.Types.ObjectId, ref: 'submit'}], // 提交列表  是一个 list，其中的每个元素都是表 submits 中的某一条主键
    compileStatus: Number, // 当前编译仿真的状态 0：上一次编译仿真成功；1：还没有一次已经结束的编译仿真 2：上一次编译仿真错误但是曾经成功过 3：编译仿真还没有成功过
    topEntityName: String, // 顶层设计体的名称

    // 以下三条针对于 homework
    homework: {type: Schema.Types.ObjectId, ref: 'homework'}, // 这个工程所对应的作业。如果是 playground 则为 undefined
    score: Number, // 分数。如果是 playground 则为 1
    hwSubmitBox: [{type: Schema.Types.ObjectId, ref: 'submit'}], // 作业 提交列表。如果是 playground 则为空

    input: Array, // 针对于拖拽项目，记录输入端口名
    output: Array, // 针对于拖拽项目，记录输出端口名

    lastSimulationTime: Number, // 上一次仿真的时间
    entityPath: String // 所用到的元件的路径
});

var project = mongodb.mongoose.model('project', projectSchema);

module.exports = project;