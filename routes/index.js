var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var codeGenerator = require("../VHDL/VHDLCodeGenerator");
var cpuCodeGenetator = require("../VHDL/CPUCodeGenerator");
var user = require("../dataBase/model/user");
var project = require("../dataBase/model/project");
var process = require('child_process');
var path = require('path');
var modelsim = require('./modelsim.js');
var submit = require('../dataBase/model/submit');
var cpuSCG = require('../VHDL/simulationCodeGenerator');
var SCG = require('../VHDL/simpleSimulationCodeGet');

router.get('/', function(req, res, next) {
    console.log(res.locals);
    if(res.locals.user && res.locals.user.authority == 0)
    {
        console.log('get /');
        console.log(res.locals.user);
        user.findById(res.locals.user._id).populate({
            path: 'homeworkBox',
            populate: {path: "homework"}
        }).populate('projectBox')
            .exec(function (err, obj){
                req.session.user = {
                    userName: obj.userName,
                    _id: obj._id,
                    password: obj.password,
                    authority: obj.authority
                };
                res.render('index',{title: "Index", projectList: obj.projectBox.reverse(), homeworkList: obj.homeworkBox.reverse() });
            });
    }
    else if(res.locals.user && res.locals.user.authority == 1)
        res.redirect('/admin');
    else
        res.redirect('/login');
});
router.post('/file/uploadEditor', function (req, res, next) {
    var prjID = req.body.projectId;
    var originFilePath = req.body.filePath;
    var newName = req.body.name;
    var text = req.body.text;
    project.findById(prjID, function (err, prj) {
        if(originFilePath != "") {
            if (prj.filePath != path.dirname(originFilePath)) { // 文件路径和项目是否匹配
                console.log("the origin file does not belongs to the project!");
                res.json({
                    status: "error",
                    msg: "the origin file does not belongs to the project!"
                });
                return;
            }
            //delete the origin file
            if(!fs.existsSync(originFilePath)) // 如果不存在原始的文件的话
            {
                console.log("the origin file does nor exist");
                res.json({
                    status: "error",
                    msg: "the origin file does nor exist"
                });
                return;
            }
            fs.unlinkSync(originFilePath); // 删除原始文件
        }
        console.log(newName);
        fs.writeFile(path.join(prj.filePath, newName), text, function (err) {
            if(err)
                res.render('error', {error: err});
            else
                res.json({status: "success"});
        });
    })


});
router.post('/file/uploadGraph',function(req, res, next){

    text = req.body.link;
    var currentProject =  res.locals.project;
    var filePath = path.join(currentProject.filePath, currentProject.topEntityName);
    fs.open(filePath, 'w', function (err, fd) {
        if(err)
            res.render('error', {error: err});
        console.log(text);
        var writeBuffer = new Buffer(text),
            offset = 0,
            len = writeBuffer.length,
            filePostion = null;
        fs.write(fd, writeBuffer, offset, len, filePostion, function(err, readByte){
            if(err)
                res.render('error', {error: err});
            console.log('写数据总数：'+readByte+' bytes' );

            // if a drag project, generate VHDL file according to req.body.link
            console.log("type: " + currentProject.type);
            if(currentProject.type == 0){
                var portInfo = new Object();
                codeGenerator(currentProject.filePath, JSON.parse(req.body.link), currentProject.topEntityName, portInfo,function (err) {
                    if(err)
                        res.render('error', {error: err});
                    console.log("input: " + portInfo.input + " output: " + portInfo.output);
                    project.update({_id: currentProject._id}, {$set:{input: portInfo.input, output: portInfo.output}}, function (err) {
                        res.json({status: "success"});
                    });

                });
            }
            else//editor project
                res.json({status: "success"});
        });
    });
});

router.post('/file/uploadCpuGraph', function (req, res, next) {

    text = req.body.link;
    var currentProject =  res.locals.project;
    console.log(currentProject.filePath);
    var filePath = path.join(currentProject.filePath, currentProject.topEntityName);
    console.log("filePath: " + filePath);
    fs.open(filePath, 'w', function (err, fd) {
        if(err)
            res.render('error', {error: err});
        console.log(text);
        var writeBuffer = new Buffer(text),
            offset = 0,
            len = writeBuffer.length,
            filePostion = null;
        fs.write(fd, writeBuffer, offset, len, filePostion, function(err, readByte){
            if(err)
                res.render('error', {error: err});
            console.log('写数据总数：'+readByte+' bytes' );

            // if a drag project, generate VHDL file according to req.body.link
            var portInfo = new Object();
            cpuCodeGenetator(currentProject.filePath, JSON.parse(req.body.link), currentProject.topEntityName, portInfo, currentProject.entityPath,function (err) {
                if(err)
                    res.render('error', {error: err});
                console.log("input: " + portInfo.input + " output: " + portInfo.output);
                project.update({_id: currentProject._id}, {$set:{input: portInfo.input, output: portInfo.output}}, function (err) {
                    res.json({status: "success"});
                });

            });
        });
    });
});


router.get('/download/kkk', modelsim.download);
router.post('/file/uploadFile', modelsim.upload);
router.post('/file/simulate', modelsim.simulate);
router.get('/deleteProject',function (req, res, next) {
    var projectId = req.query.projectId;
    var currentUserId;
    if(req.query.userId != undefined)
        currentUserId = req.query.userId;
    else
        currentUserId = res.locals.user._id;
    user.findById(currentUserId, function (err, obj) {
        if(err)
            throw err;
        else if(obj == null)
            throw new Error("No such user!");
        else{
            var index = obj.projectBox.indexOf(projectId);
            if(index == -1)
                throw new Error("The user do not have such project!");

            console.log(obj.projectBox);
            console.log(index);
            obj.projectBox.splice(index, 1);
            console.log(obj.projectBox);
            obj.save(function (err) {
                if(err)
                    throw err;
                project.findOneAndRemove({_id: projectId}).exec(function(err, retPrj){
                    if(err)
                        throw err;
                    if(retPrj == null)
                        throw new Error("No such project!");
                    // delete corresponding files and submit entity
                    process.exec('rm -r ' + retPrj.filePath, function (err, stdout, stderr) {
                        console.log(stdout + '\n' + stderr + "\n===");
                        for(var i = 0; i < retPrj.submitBox.length; ++ i){
                            submit.findOneAndRemove({_id: retPrj.submitBox[i]}).exec(function(err, retSbm){
                                process.exec('rm -r ' + retSbm.filePath, function (err, stdout, stderr) {
                                    console.log(stdout + '\n' + stderr + "\n!!!");
                                });
                            });
                        }
                    });
                    res.redirect("/");
                });
            })

        }
    });
});
router.post('/createProject', function (req, res, next) {
    var currentUserId;
  if(req.body.userId != undefined)
      currentUserId = req.body.userId;
    else
      currentUserId = res.locals.user._id;
  var projectName = req.body.projectName;
  var projectType = req.body.projectType;
  var topEntity = req.body.topEntity;
  var inputFile = req.body.inputFile;
  var newProject = new project({
      author: currentUserId,
      projectName: projectName,
      type: new Number(projectType),
      deleted: false,
      createTime: new Date(),
      lastModifiedTime: new Date(),
      filePath: "",
      inputFile: inputFile,
      submitBox: [],
      topEntityName: topEntity,
      compileStatus: 1,
      lastSimulationTime: 0,
      entityPath: ""
  });
    //注意查重
    project.findOne({projectName: newProject.projectName, author: currentUserId}, function (err, obj) {
        if(err)
            res.render('error', {error: err});
        if(obj != null)
           res.status(500).send("The project name has been used!");
        else {
           newProject.save(function (err){
               if(err)
                   res.render('error', {error: err});
               else {
                   user.findById(currentUserId, function (err, obj_) {
                       if(err)
                           res.render('error', {error: err});
                       obj_.projectBox.push(newProject._id);
                       obj_.save(function (err) {
                           if(err)
                               throw err;
                           project.findOne({projectName: newProject.projectName, author: currentUserId},function (err, obj) {
                               // 我们需要用到工程的主键 _id，因此再次对数据库进行查询。
                               if(err)
                                   res.render('error', {error: err});
                               if(obj == null)
                                   res.render('error', {error: "Why cannot find the project just saved!"});
                               var Path = "/home/kinnplh/projectFile";
                               Path = path.join(Path, obj._id.toString());
                               obj.filePath = Path;

                               var PathEntity = "/home/kinnplh/cpuEntity";
                               PathEntity = path.join(PathEntity, obj._id.toString());
                               obj.entityPath = PathEntity;
                               obj.save(function (err) { // 存回数据库，并且对本地的存储数据加以维护
                                   if(err)
                                       res.render('error', {error: err});
                                   process.exec("mkdir " + Path + ";mkdir " + PathEntity, function (err, stdout, stderr){
                                       if(err)
                                           res.render('error', {error: err});
                                       var fileSuffix = "";
                                       if(obj.type == 1)// editor
                                        fileSuffix = ".vhd";
                                       var cmd = "touch " + path.join(obj.filePath, obj.topEntityName + fileSuffix);
                                       if(obj.type == 2)
                                           cmd += "; cp " + path.resolve(path.dirname(fs.realpathSync(__filename)),
                                                   '..', './chipInfo/vhdls', './* ') + obj.entityPath;
                                       // 三种类型的工程对应的 cmd 是不一样的
                                        process.exec(cmd, function (err, stdout, stderr) {
                                                if(err)
                                                   res.render('error', {error: err});
                                                if(req.session)
                                                    req.session.user = obj_;
                                               //res.redirect('/');
                                                res.json({
                                                    projectId: obj._id
                                                });
                                           });
                                   });
                               });
                           });
                       })
                   })
               }
           });
       }
    });
});
router.post('/file/reloadJili', function (req, res, next) {
    var projectId = req.body.projectId;
    var inputSignal = JSON.parse(req.body.inputSignal);
    var editSignal = JSON.parse(req.body.editSignal);
    console.log(projectId);
    console.log(inputSignal);
    console.log(editSignal);
    project.findById(projectId).exec(function (err, retPrj) {
        if(retPrj.type == 2)
            cpuSCG(retPrj, inputSignal, editSignal, function (err) {
                retPrj.lastSimulationTime = editSignal[0][editSignal[0].length - 1] - 1;
                retPrj.save(function (err) {
                    res.json({
                        status: "success"
                    });
                });

            });
        else
            SCG(retPrj, inputSignal, editSignal, function (err) {
                retPrj.lastSimulationTime = editSignal[0][editSignal[0].length - 1] - 1;
                retPrj.save(function (err) {
                    res.json({
                        status: "success"
                    });
                });

            });

    });
});
module.exports = router;
