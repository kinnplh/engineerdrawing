/**
 * Created by kinnplh on 10/30/16.
 */
var express = require('express');
var router = express.Router();
var homework = require('../../dataBase/model/homework');
var user = require('../../dataBase/model/user');
var path = require('path');
var multiparty = require('multiparty');
var fs = require('fs');
var process = require('child_process');
var vcd = require('../vcd.js');
var project = require('../../dataBase/model/project');


router.get('/createHomeWork', function (req, res, next) {
    process.exec("rm /home/kinnplh/homeworkFile/tem/*", function (err, stdout, stderr) {
        res.render("admin/createHomework");
    });

});
router.post('/newHomeworkBasicInfo', function (req, res, next) {
    //get the basic info
    //and set to the session
    var newHw = {
        hwName: req.body.homeworkName,
        type: req.body.homeworkType,
        topEntityName: req.body.topEntityName,
        inPortName: req.body.inputPortName.split(",").filter(function (portName, id) {
            if(portName == '' || portName == ';')
                return false;
            return true;
        }),
        outPortName: req.body.outputPortName.split(",").filter(function (portName, id) {
            if(portName == '' || portName == ';')
                return false;
            return true;
        }),
        deadline: new Date(req.body.deadline),
        filePath: "",
        inputFile: req.body.simulateFileName,
        simulateRes: "",
        xtime: "",
        lastlist: [],
        changelist: [],
        signalname: [],
        describe: req.body.describe,
        correspondProject: []
    };
    req.session.newHw = newHw;
    res.locals.newHw = newHw;
    res.json({status: "success"});
});
router.post('/uploadStandardFiles', function (req, res, next) {
    var temSavePath = "/home/kinnplh/homeworkFile/tem/";
    var form = new multiparty.Form({uploadDir: temSavePath});

    form.parse(req, function(err, fields, files) {
        var filesTmp = JSON.stringify(files,null,2);

        if(err){
            console.log('parse error: ' + err);
        } else {
            console.log(files);
            console.log('parse files: ' + filesTmp);
            console.log('length:'+files.file.length);
            var fileNum = files.file.length;
            for(var i = 0; i < fileNum; i++){
                var inputFile = files.file[i];
                var uploadedPath = inputFile.path;
                var pathAfterChange = path.join(path.dirname(uploadedPath), inputFile.originalFilename);
                fs.rename(uploadedPath, pathAfterChange, function (err) {
                    if(err)
                        res.render('error',{error: err});
                });
            }
        }
    });
    res.json({status: "success"});
});
router.post('/homeworkSimulate', function (req, res, next) {
    var newHw = res.locals.newHw;
    var temSavePath = "/home/kinnplh/homeworkFile/tem/";

    process.exec('cp ' + __dirname.slice(0,-13)+'/public/files/model.sh ' + temSavePath, function (err, stdout, stderr){
        //move the script to the folder
        console.log('cp ' + __dirname.slice(0,-13)+'/public/files/model.sh ' + temSavePath);
        var compileFiles =  newHw.topEntityName;
        var fileArray = fs.readdirSync(temSavePath).filter(function (fileName, id) {
            if (path.extname(fileName) == ".vhd")
                return true;
            else
                return false;
        });
        fileArray.forEach(function (ele, id) {
            console.log(ele + path.basename(newHw.inputFile));
            if (ele == newHw.topEntityName + '.vhd' || ele == path.basename(newHw.inputFile))
                return;
            compileFiles += (".vhd " + path.basename(ele, '.vhd'));
        });

        console.log(compileFiles);
        process.execFile(path.join(temSavePath, "model.sh"), [compileFiles, path.basename(newHw.inputFile, '.vhd'), "vsim"], {cwd: temSavePath}, function (err, stdout, stderr){
            if(stderr != "")
            {
                res.json({
                    status: 1,
                    stdoutMsg: stdout,
                    stderrMsg: stderr
                });
            }
            else {
                //look into the vcd fle and
                //pass enough msg to the front to show the results
                var xtime = "";
                var lastlist = new Array();
                var changelist = new Array();
                var signalname;
                fs.createReadStream(path.join(temSavePath, "dump.vcd"))
                    .pipe(vcd.createStream())
                    .on('begin', function (state) {
                        // state contains date, variable definitions, etc.
                        //console.log(state);
                    })
                    .on('sample', function (index, changes, last) {
                        // index = number of sample
                        // changes = hash of changed vars (by name)
                        // last = last state of all vars
                        signalname = new Array();
                        vectorSignalName = new Array();


                        const changeordered = {};
                        Object.keys(changes).sort(compareFunc).forEach(function(key) {
                            changeordered[key] = changes[key];
                        });
                        const lastordered = {};
                        Object.keys(last).sort(compareFunc).forEach(function(key) {
                            lastordered[key] = last[key];
                        });

                        console.log("change");
                        console.log(changeordered);
                        console.log("last"+last);
                        for (key in lastordered) {
                            //console.log(key);
                            signalname.push(key );
                        }
                        var k = signalname.length-1;
                        lasttemp = [];
                        for(var key in lastordered){
                            if(lastordered[key] == 0)
                            {
                                lasttemp.push(0);
                            }
                            else
                            {
                                lasttemp.push(1);
                            }
                            k = k - 1;
                        }
                        changetemp = [];
                        k = signalname.length-1;
                        for(var key in changeordered){
                            if(changeordered[key] == 0){
                                changetemp.push(1);
                            }else if(changeordered[key] == 1){
                                changetemp.push(0 );
                            }else{
                                changetemp.push(changeordered[key]);
                            }
                            k = k - 1;

                        }
                        lastlist.push(lasttemp);
                        changelist.push(changetemp);
                        // console.log(lastlist);
                        xtime = xtime + index + " ";
                    }).on('finish',function(){
                    list = new Array();
                    list = xtime.split(" ");
                    list = xtime.split(" ").slice(1,-1);
                    list.unshift("0");
                    //list.push((parseInt(list[1])+parseInt(list[list.length-1])).toString());
                    //console.log(xtime);
                    for(var i in list)
                    {
                        list[i] = (parseInt(list[i])/1000).toString();
                    }
                    xtime =  JSON.stringify(list);
                    var vectortemp = "";
                    var vectorlist = new Array();
                    for(var i in signalname)
                    {
                        console.log(i + " " + signalname[i] + " !!!");
                        var z = signalname[i].indexOf('[');
                        if(z == -1)
                        {
                            vectorSignalName.push(signalname[i]);
                            vectorlist.push(i);
                        }
                        else
                        {
                            var name = signalname[i].slice(0,z);
                            if(vectorSignalName.slice(-1) != name)
                            {
                                vectorSignalName.push(name);
                                vectorlist.push(i);
                            }
                        }
                    }
                    console.log(vectorlist);
                    changelist = new Array();
                    console.log(vectorlist);
                    for(i in lastlist)
                    {
                        var newChangeListSub = new Array();
                        var j = 0;
                        for(var k in lastlist[i])
                        {

                            console.log(k == parseInt(vectorlist[j]));


                            if(k == parseInt(vectorlist[j]))
                            {
                                if(k != 0)
                                {
                                    newChangeListSub.push(vectortemp);
                                }

                                vectortemp = "";
                                j++;
                            }
                            if(k == lastlist[i].length-1)
                            {
                                console.log("vectorTempBefore: " +vectortemp);
                                vectortemp = vectortemp + lastlist[i][k].toString();
                                newChangeListSub.push(vectortemp);
                                console.log("vectorTempAfter: " +vectortemp);
                                break;

                            }
                            vectortemp = vectortemp + lastlist[i][k].toString();

                        }
                        console.log("qwertyu" + newChangeListSub);
                        changelist.push(newChangeListSub);
                    }
                    xtime =  JSON.stringify(list);
                    newHw.xtime = xtime;
                    newHw.changelist = JSON.stringify(changelist);
                    newHw.lastlist = JSON.stringify(lastlist);
                    newHw.signalname = JSON.stringify(vectorSignalName);
                    newHw.simulationTime = 0;
                    req.session.newHw = newHw;
                    res.locals.newHw = newHw;
                    res.json({
                        status: 0,
                        newHw: newHw
                    });
                });
                //generate enough msg to show the results
                //
            }
        });

    });

});
router.post('/deleteHomeworkFile', function (req, res, next) {
    var fileName = req.body.fileName;
    var temSavePath = "/home/kinnplh/homeworkFile/tem/";
    var fullPath = path.join(temSavePath, fileName);
    if(fs.existsSync(fullPath)){
        fs.unlink(fullPath, function (err) {
            res.json({
                status: 0
            });
        });
    }
    else {
        res.json({
            status: 1,
            msg: "no such file"
        });
    }
});
router.post('/createHomeworkFinished', function (req, res, next) {
    var newHw = res.locals.newHw;
    var newHomework = new homework(newHw);
    var temSavePath = "/home/kinnplh/homeworkFile/tem/";
    //if the homework name used
    console.log("nhcl:");
    console.log(newHw.changelist);
    console.log(JSON.parse(newHw.changelist));



    homework.findOne({hwName: newHomework.hwName}, function (err, obj) {
       if(obj != null){
           res.json({
               status: 1,
               msg: "The homework name has been used already"
           });
           return;
       }

       //save the current homework
       // and push to the homework box
       newHomework.save(function (err) {
           if(err)
               res.render('error', {error: err});
           newHomework.filePath = "/home/kinnplh/homeworkFile/" + newHomework._id;
           var newFolderPath = "/home/kinnplh/homeworkFile/" + newHomework._id;
           user.find({authority: 0}, function (err, users) {
               if(err)
                   res.render('error', {error: err});
               console.log(users);
               for(var i = 0; i < users.length; ++ i){
                   var homeworkProject = new project({
                       projectName: newHomework.hwName,
                       author: users[i]._id,
                       type: newHomework.type,
                       deleted: false,
                       createTime: new Date(),
                       lastModifiedTime: new Date(),
                       filePath: "", // to be determined
                       inputFile: newHomework.inputFile,
                       submitBox: [],
                       compileStatus: 1,
                       topEntityName: newHomework.topEntityName,

                       homework: newHomework._id,
                       score: 0,
                       hwSubmitBox: []
                   });

                   newHomework.correspondProject.push(homeworkProject._id);

                    homeworkProject.save(
                        (function (i) {
                            return function (err) {
                                users[i].homeworkBox.push(homeworkProject._id);
                                users[i].save(function (err) {
                                    homeworkProject.filePath = path.join("/home/kinnplh/projectFile", "" + homeworkProject._id);
                                    process.exec("mkdir " + homeworkProject.filePath, function (err, stdout, stderr) {
                                            homeworkProject.save(function (err) {
                                                var fileSuffix = "";
                                                if(homeworkProject.type == 1)
                                                    fileSuffix = ".vhd";
                                                process.exec("touch " + path.join(homeworkProject.filePath, homeworkProject.topEntityName + fileSuffix), function (err, stdout, stderr){

                                                });
                                            });
                                    });
                                });
                            }
                        })(i)
                    );

               }

           });
           //move the current files out of tem
           //for future possible use

           process.exec("mkdir " + newFolderPath, function (err, stdout, stderr) {
               process.exec("mv " + temSavePath + '* ' + newFolderPath, function (err, stdout, stderr) {
                   newHomework.save(function () {
                       res.json({
                           status: 0
                       });
                   });

               });
           });

       });


    });
});
function compareFunc(a, b) {
    if(a.indexOf('[') == -1 || b.indexOf('[') == -1){
        var pureNameA = (a.indexOf('[') != -1)? a.slice(0, a.indexOf('[')): a;
        var pureNameB = (b.indexOf('[') != -1)? b.slice(0, b.indexOf('[')): b;
        if(pureNameA < pureNameB)
            return -1;
        else if(pureNameA == pureNameB)
            throw new Error("reused name");
        else
            return 1;
    }
    else {
        var pureNameA = (a.indexOf('[') != -1)? a.slice(0, a.indexOf('[')): a;
        var pureNameB = (b.indexOf('[') != -1)? b.slice(0, b.indexOf('[')): b;

        if(pureNameA < pureNameB)
            return -1;
        else if(pureNameA == pureNameB){
            var numA = parseInt(a.slice(a.indexOf('[') + 1, a.indexOf(']')));
            var numB = parseInt(b.slice(b.indexOf('[') + 1, b.indexOf(']')));
            if(numA > numB)
                return -1;
            else if(numA < numB)
                return 1;
            else
                throw new Error("reused name");
        }
        else
            return 1;

    }




}

module.exports = router;