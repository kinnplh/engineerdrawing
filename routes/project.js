/**
 * Created by kinnplh on 2016/10/6.
 */
var express = require('express');
var router = express.Router();
var project = require('../dataBase/model/project');
var submit = require('../dataBase/model/submit');
var fs = require('fs');
var path = require('path');
var c74s = require('../chipInfo/c74s');
var cpu_comps = require('../chipInfo/cpu_comps');


router.post('/project/getFileTree', function (req, res, next) {
    var prjId = req.body.projectId;
    console.log("prjId: " + prjId);
    project.findById(prjId, function (err, prj) {
        res.json({
            fileTree: getDirStruct(prj.filePath)
        });
    });
});
router.get('/project', function (req, res) {
    var currentUser = res.locals.user;
    var projectId = req.query.projectId;
    //似乎没有根据user先找一遍的必要
    project.findById(projectId).populate('submitBox').populate('homework').exec(function (err, obj) {
        if(err)
            res.render('error', { error: err });
        if(obj == null)
            res.render('error', { error: "No such project" });
        req.session.project = {
            _id: obj._id,
            filePath: obj.filePath,
            inputFile: obj.inputFile,
            topEntityName: obj.topEntityName,
            entityPath: obj.entityPath,
            type: obj.type
        };
        res.locals.project = {_id: obj._id};

        var projectRoot = obj.filePath;
        if(obj.type == 1) { //Editor
            var struct = getDirStruct(obj.filePath);
            if(obj.homework != undefined && obj.homework != null)
                res.render('editor', {fileTree: struct, simulateFile: obj.inputFile, topEntity: obj.topEntityName ,projectId: obj._id, homework: obj.homework, pathNav:[{name: obj.projectName, link: "/project?projectId="+obj._id}]});
            else
                res.render('editor', {fileTree: struct, simulateFile: obj.inputFile, topEntity: obj.topEntityName ,projectId: obj._id,pathNav:[{name: obj.projectName, link: "/project?projectId="+obj._id}]});
        } else if(obj.type == 0) { // drag and drop
            //get the file and pass the info to
            var circuitFileName = path.join(obj.filePath, obj.topEntityName);
            fs.readFile(circuitFileName, function (err, circuitDescribe) {
                if(err)
                   res.render('error', {error: err});
                //console.log("canvas.c74s: " + c74s);
                if(obj.homework != undefined && obj.homework != null)
                    res.render('canvas', { c74s: c74s, circuit: circuitDescribe, projectId: obj._id, homework: obj.homework, pathNav:[{name: obj.projectName, link: "/project?projectId="+obj._id}]});
                else
                    res.render('canvas', { c74s: c74s, circuit: circuitDescribe, projectId: obj._id,pathNav:[{name: obj.projectName, link: "/project?projectId="+obj._id}]});
            });
        } else if(obj.type == 2){
            var circuitFileName = path.join(obj.filePath, obj.topEntityName);
            var compDir = obj.entityPath;
            var chips = cpu_comps(compDir);
            console.log("chips:");
            console.log(chips);

            fs.readFile(circuitFileName, function (err, circuitDescribe) {
                if(err)
                    res.render('error', {error: err});
                res.render('cpu', { c74s: chips, circuit: circuitDescribe, projectId: obj._id,pathNav:[{name: obj.projectName, link: "/project?projectId="+obj._id}]});
            });
        }
        else
            res.render('error', {error: "Invalid project type"});
    });
});
router.post('/project/projectSettingChange', function (req, res, next) {
    var prjId = req.body.projectId;
    var topEntityName = req.body.topEntityName;
    var inputFile = req.body.inputFile;

    project.findById(prjId, function (err, prj) {
        prj.topEntityName = topEntityName;
        prj.inputFile = inputFile;
        prj.save(function (err) {

            res.json({status: "success"});
        });
    });
});
router.post('/project/getFileTree', function (req, res, next) {
    var prjId = req.body.projectId;
    project.findById(prjId, function (err, prj) {
        res.json({
            fileTree: getDirStruct(prj.filePath)
        });
    });
});
function File(name, path) {
    this.name = name;
    this.type = "file";
    this.path = path;
}

function Dir(name, children) {
    this.name = name;
    this.type = "folder";
    this.children = children;
}

function getDirChildren(root) {
    var fileArray = fs.readdirSync(root);//root is an absolute path!!
    var res = [];
    for(var i = 0; i < fileArray.length; ++ i)
    {
        var name = fileArray[i];
        var p = path.join(root, name);
        var fileStat = fs.statSync(p);
        if(fileStat)
        {
            if(fileStat.isFile())
                res.push(new File(name, p));
            else if(fileStat.isDirectory())
                res.push(new Dir(name, getDirChildren(p)));
        }
    }

    return res;
}

function getDirStruct(root) {
    var res = new Dir('Root', getDirChildren(root));
    res =  JSON.stringify(res);
    console.log(res);
    return res;
}



module.exports = router;