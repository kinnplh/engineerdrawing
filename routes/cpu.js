/**
 * Created by claud on 2016/10/2.
 */
var express = require('express');
var router = express.Router();
var logger = require('../logconfig');
var cpu_comps = require('../chipInfo/cpu_comps');
var project = require('../dataBase/model/project');
var user = require('../dataBase/model/user');
var fs = require('fs');
var path = require('path');
var multiparty = require('multiparty');
// 最好把芯片信息放在数据库或者某个非public的文件夹中，由express的router传进来
// 而不是像现在这样直接读JS文件

logger.info('cpu router says hey');

/* GET home page. */
// router.get('/', function(req, res, next) {
//     res.render('cpu', {
//         c74s: cpu_comps
//     });
// });

router.get('/chipEditor', function (req, res, next) {
    var projectId = req.query.projectId;
    project.findById(projectId, function (err, retPrj) {
        if (retPrj == null || retPrj.type != 2) {
            res.render('error', {error: "Invalid project ID"});
            return;
        }
        var struct = getDirStruct(retPrj.entityPath);
        res.render('chipEditor', {fileTree: struct, projectId: retPrj._id, pathNav:[{name: retPrj.projectName, link: "/project?projectId="+ retPrj._id},
            {name: "chip editor", link: "/cpu/chipEditor?projectId=" + retPrj._id}]});

    });
});


router.post('/getFileTree', function (req, res, next) {
    var prjId = req.body.projectId;
    project.findById(prjId, function (err, prj) {
        res.json({
            fileTree: getDirStruct(prj.entityPath)
        });
    });
});


router.post('/getFileContent', function (req, res, next) {
    var Path = req.body.path;
    var currentUser = res.locals.user;
    var currentProjectId = req.body.projectId;
    user.findById(currentUser._id)
        .populate('projectBox')
        .populate({
            path: "homeworkBox",
            populate: {path: "homework"}
        })
        .exec(function (err, obj) {
            if(err)
                res.render('error', { error: err });
            if(obj == null)
                res.render('error', { error: "No such user" });
            var currentProject = null;
            var l = obj.projectBox.length;
            for(var i = 0; i < l; ++ i){
                if(obj.projectBox[i]._id == currentProjectId) {
                    currentProject = obj.projectBox[i];
                    break;
                }
            }
            if(currentProject == null)
                res.render('error', { error: "No such project" });
            var pathRoot = currentProject.entityPath;
            var absolutePath = Path;
            fs.stat(absolutePath, function (err, stat) {
                if(err)
                    res.render('error', { error: err });
                if(stat == null || stat.isFile() == false)
                    res.render('error', { error: "The file is not available" });
                fs.readFile(absolutePath, 'utf8',function (err, content) {
                    if(err)
                        res.render('error', { error: err });
                    res.json({
                        content: content,
                        status: 'success'
                    });
                })
            });

        });
});

router.post('/uploadFile', function (req, res, next) {
    console.log(req);
    project.findById(res.locals.project._id, function (err, retPrj) {
        if(err)
            res.render('error', {error: err});
        if(retPrj == null)
            res.render('error', {error: "No such project!"});
        var projectPath = retPrj.entityPath;

        //生成multiparty对象，并配置上传目标路径
        var form = new multiparty.Form({uploadDir: projectPath});
        //上传完成后处理
        form.parse(req, function(err, fields, files) {
            var filesTmp = JSON.stringify(files,null,2);

            if(err){
                console.log('parse error: ' + err);
            } else {
                var fileNum = files.inputFile.length;
                for(var i = 0; i < fileNum; i++){
                    var inputFile = files.inputFile[i];
                    var uploadedPath = inputFile.path;
                    var pathAfterChange = path.join(path.dirname(uploadedPath), inputFile.originalFilename);
                    fs.rename(uploadedPath, pathAfterChange, function (err) {
                        if(err)
                            res.render('error',{error: err});
                    });
                }
                res.json({status: "success"});
            }
        });
    });
});
router.post('/deleteFile', function (req, res, next) {
    var prjId = req.body.projectId;
    var pathOfFile = req.body.filePath;
    var fileName = path.basename(pathOfFile);
    var pathName = path.dirname(pathOfFile);
    //to check if the path and the project match
    project.findById(prjId, function (err, prj) {
        if(prj.entityPath != pathName || !fs.existsSync(pathOfFile)) {
            res.json({
                status: "error",
                msg: "no such file"
            });
            return;
        }
        fs.unlink(pathOfFile, function (err) {
            if(err)
                res.render('error', {error: err});
            else
                res.json({status: "success"});
        });
    })
});

router.post('/uploadEditor', function (req, res, next) {
    var prjID = req.body.projectId;
    var originFilePath = req.body.filePath;
    var newName = req.body.name;
    var text = req.body.text;
    project.findById(prjID, function (err, prj) {
        if(originFilePath != "") {
            if (prj.entityPath != path.dirname(originFilePath)) {
                console.log("the origin file does not belongs to the project!");
                res.json({
                    status: "error",
                    msg: "the origin file does not belongs to the project!"
                });
                return;
            }
            //delete the origin file
            if(!fs.existsSync(originFilePath))
            {
                console.log("the origin file does not exist");
                res.json({
                    status: "error",
                    msg: "the origin file does not exist"
                });
                return;
            }
            fs.unlinkSync(originFilePath);
        }
        console.log(newName);
        console.log("path: " + path.join(prj.entityPath, newName));
        fs.writeFile(path.join(prj.entityPath, newName), text, function (err) {
            if(err)
                res.render('error', {error: err});
            else
                res.json({status: "success"});
        });
    })

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
