/**
 * Created by lixin on 2016/10/3.
 */
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var path = require('path');
var project = require('../dataBase/model/project');
var user = require('../dataBase/model/user');
var submit = require('../dataBase/model/submit');
var vcd = require('./vcd.js');
var split = require('split');
var homework = require('../dataBase/model/homework');
//require("fusioncharts/fusioncharts.charts")(FusionCharts);


function compare2DArray(array1, array2) {
   if(array1.length != array2.length)
      return false;
   for(var i = 0; i < array2.length; ++ i){
      var subArr1 = array1[i];
      var subArr2 = array2[i];
      if(subArr1.length != subArr2.length)
         return false;
      for(var j = 0; j < subArr2.length; ++ j)
         if(subArr1[j] != subArr2[j])
            return false;
   }
   return true;
}


exports.download = function(req, res){
   var submitId = req.query.submitId;
   var submitIdForFIle = req.query.submitIdForFile;
   if(submitId) {
      submit.findById(submitId, function (err, retSubmit) {
         var file = retSubmit.simulateRes;
         res.download(file);
      });
   } else
   {
      submit.findById(submitIdForFIle, function (err, retSubmit) {
         var filePath = retSubmit.filePath;
         var zipPath = path.join(filePath, 'all.zip');
         fs.exists(zipPath, function (exists) {
            if(exists)
               res.download(zipPath);
            else
            {
               var process = require('child_process');
               process.exec("zip -r " + zipPath + ' *', {cwd: filePath},function (err, stdout, errout) {
                  res.download(zipPath);
               });
            }
         });
      });
   }
};

exports.upload = function uploadFile(req,res){//just upload files and no simulation following

   //may be difficult to get rid of variables stored in locals
   console.log(req);
   // 这里使用了存储在 locals 中的当前 project 的_id，我在想表单里应该已经把工程的_id发过来了。。。不知道为什么会这样写。。。
   project.findById(res.locals.project._id, function (err, retPrj) {
      if(err)
         res.render('error', {error: err});
      if(retPrj == null)
         res.render('error', {error: "No such project!"});
      var projectPath = retPrj.filePath;

      //生成multiparty对象，并配置上传目标路径
      var form = new multiparty.Form({uploadDir: projectPath});
      //上传完成后处理
      form.parse(req, function(err, fields, files) {
         var filesTmp = JSON.stringify(files,null,2);

         if(err){
            console.log('parse error: ' + err);
         } else {
            console.log('parse files: ' + filesTmp);
            console.log('length:'+files.inputFile.length);
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
};

exports.simulate = function (req, res) {
   var prjId = req.body.projectId;
   var hwId = req.body.homeworkId;// may be undefined  仅仅对于 homework
   var hwPath = req.body.filePath;// may be undefined  仅仅对于 homework

   project.findById(prjId, function (err, retPrj) {
      if(err)
         res.render("error", {error: err});
      var newSubmit = new submit({
         time: new Date(),
         project: retPrj._id,
         state: 0, // simulate processing
         stdMsg: "",
         errMsg: "",
         filePath: "",
         simulateRes: "",
         xtime: "",
         lastlist: [],
         changelist: [],
         signalname: [],
         score: undefined,
         simulationTime: retPrj.lastSimulationTime
      });
      newSubmit.save(function (err) {
         if(err)
            res.render('error', {error: err});
         if(hwId == undefined)
            retPrj.submitBox.push(newSubmit._id);
         else
            retPrj.hwSubmitBox.push(newSubmit._id);
         var process = require('child_process');
         newSubmit.filePath =  path.join("/home/kinnplh/submitFile", newSubmit._id.toString());
         newSubmit.inputFile = path.join(newSubmit.filePath, path.basename(retPrj.inputFile));
         process.exec("mkdir " + newSubmit.filePath, function (err, stdout, stderr) { // 建立和这个提交相对应的文件夹
            //var projectPath = retPrj.filePath;
            // 然后将当前存储项目文件的文件夹中的所有文件都拷贝过去
            process.exec("cp -r " + path.join(retPrj.filePath, '*') + ' ' + newSubmit.filePath, function (err, stdout, stderr) {
               console.log("stdout: " + stdout);
               console.log("stderr: " + stderr);
               var cmd = 'cp ' + __dirname.slice(0,-6)+'/public/files/model.sh ' + newSubmit.filePath;
               if(hwId != undefined)
                  cmd += ";cp " + path.join(hwPath, retPrj.inputFile) + " " + newSubmit.filePath;

               process.exec(cmd, function (err, stdout, stderr) {
                  var compileFiles = retPrj.topEntityName; // 参与仿真的文件
                  if(retPrj.type == 1 || retPrj.type == 2) {//the compile and simulation of drag and drop only include topEntity and simulation file
                     var fileArray = fs.readdirSync(newSubmit.filePath).filter(function (fileName, id) {
                        if (path.extname(fileName) == ".vhd")
                           return true;
                        else
                           return false;
                     });
                     fileArray.forEach(function (ele, id) {
                        if (ele == retPrj.topEntityName + '.vhd' || ele == path.basename(newSubmit.inputFile))
                           return;
                        if(path.basename(ele, '.vhd').search(/const/i) == -1)
                           compileFiles += (".vhd " + path.basename(ele, '.vhd'));
                        else
                           compileFiles = path.basename(ele, '.vhd') + ".vhd " + compileFiles;
                     });
                  }
                  // compileFiles 的格式： "aaa.vhd bbb.vhd ccc.vhd ddd"，最后一个文件是没有后缀的
                  console.log(compileFiles);
                  // 执行文件 model.sh
                  process.execFile(path.join(newSubmit.filePath, "model.sh"), [compileFiles, path.basename(newSubmit.inputFile, '.vhd'), "vsim"], {cwd: newSubmit.filePath}, function (err, stdout, stderr) {

                     console.log("cmd: " + path.join(newSubmit.filePath, "model.sh") + ' ' + [compileFiles, path.basename(newSubmit.inputFile, '.vhd'), "vsim"]);


                     newSubmit.stdMsg = stdout;
                     newSubmit.errMsg = stderr;
                     if(newSubmit.errMsg && newSubmit.errMsg.length > 0)
                     {
                        if(retPrj.compileStatus == 1)
                           retPrj.compileStatus = 3;
                        if(retPrj.compileStatus == 0)
                           retPrj.compileStatus = 2;
                        newSubmit.state = -1;
                        newSubmit.simulateRes = null;
                        if(hwId != undefined)
                           newSubmit.score = 0;
                     }
                     else
                     {
                        retPrj.compileStatus = 0;
                        newSubmit.state = 1;
                        newSubmit.simulateRes = path.join(newSubmit.filePath, "dump.vcd");
                     }

                     //if simulate successfully, generate the info used for show
                     retPrj.save(function (err) {
                        if(err)
                           res.render('error', {error: err});
// <<<<<<< HEAD
                        if(newSubmit.state == 1)
                        {
                           var xtime = "";
                           var lastlist = new Array();
                           var changelist = new Array();
                           var signalname;
                           var vectorSignalName;
                           fs.createReadStream(path.join(newSubmit.filePath, "dump.vcd"))
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
                              console.log("signallist"+vectorSignalName);
                              console.log(",,,,"+changelist);
                              newSubmit.xtime = xtime;
                              newSubmit.changelist = changelist;
                              newSubmit.lastlist = lastlist;
                              newSubmit.signalname = vectorSignalName;
                              console.log(lastlist);





                              if(hwId == undefined) {
                                 newSubmit.save(function (err) {
                                    res.json({
                                       compileStatus: "success",
                                       message: "Compile Success!"
                                    });
                                 });
                              }
                              else {
                                 //compare the result, get score and save
                                 homework.findById(hwId, function (err, hw) {
                                    var changehw = hw.changelist[0].replace(/&#34;/g, "\"")
                                    hw.changelist = JSON.parse(changehw);
                                    var signalhw = hw.signalname[0].replace(/&#34;/g, "\"")
                                    hw.signalname = JSON.parse(signalhw);
                                    var lasthw = hw.lastlist[0].replace(/&#34;/g, "\"")
                                    hw.lastlist = JSON.parse(lasthw);
                                    var right = (xtime == hw.xtime
                                    && compare2DArray(changelist, hw.changelist)
                                    && compare2DArray(lastlist, hw.lastlist)
                                    && compare2DArray(vectorSignalName, hw.signalname));

                                    console.log("xtime and hw.xtime");
                                    console.log(xtime);
                                    console.log(hw.xtime);

                                    console.log("lastlist, hw");
                                    console.log(lastlist);
                                    console.log(hw.lastlist);

                                    console.log("changelist,hw");
                                    console.log(changelist);
                                    console.log(hw.changelist);

                                    console.log("signal,hw");
                                    console.log(signalname);
                                    console.log(hw.signalname);


                                    if(right){
                                       newSubmit.score = 1;
                                       newSubmit.save(function (err) {
                                          if(retPrj.score == 0 && new Date() < retPrj.homework.deadline){
                                             retPrj.score = 1;
                                             retPrj.save(function(err){});
                                          }
                                          res.json({
                                             result: "success",
                                             message: "Your submit should be right."
                                          })
                                       });
                                    }
                                    else{
                                       newSubmit.score = 0;
                                       newSubmit.save(function (err) {
                                          res.json({
                                             result: "danger",
                                             message: "Your submit has some problems."
                                          });
                                       });
                                    }

                                 });
                              }




                           });
                        }
                        else//not success, then save directly
                           newSubmit.save(function (err) {
                              var errors = errorMsgInterpreter(newSubmit.stdMsg);
                              if(hwId == undefined)
                                 res.json({compileStatus: "danger", message: "Compile fails. "+ stderr, errors: errors});
                              else
                                 res.json({result: "danger", message: "Compile fails. "+ stderr, errors: errors});
                           });
                     });
                  });
               });
            });
         });
      });
   });

};

function sigleError(fileName, col, row, errorMsg){
   this.fileName = fileName;
   this.col = col;
   this.row = row;
   this.errorMsg = errorMsg;
}
function errorMsgInterpreter(msg) {
   var errors = [];
   var re = /\*\*\s*Error:\s*([^:\s]*)[:\s]*(.*)/ig;
   var resArray;
   while((resArray = re.exec(msg)) != null) {
      console.log(resArray[1]);
      console.log(resArray[2]);
      var errorMsg = resArray[2];
      if (resArray[1].charAt(0) == '(') {
         var currentError = new sigleError("", -1, -1, errorMsg);
         errors.push(currentError);
         continue;
      }
      var numIndex = resArray[1].indexOf('(');
      if (numIndex == -1) {
         var currentError = new sigleError("", -1, -1, errorMsg);
         errors.push(currentError);
         continue;
      }
      var fileName = resArray[1].slice(0, numIndex);
      var row = resArray[1].slice(numIndex + 1, resArray[1].indexOf(')'));
      console.log(row);
      if (row.search(/\D/) != -1) {
         var currentError = new sigleError("", -1, -1, errorMsg);
         errors.push(currentError);
         continue;
      }
      var currentError = new sigleError(fileName, 0, parseInt(row), errorMsg);
      errors.push(currentError);
   }
   return errors;
}




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
