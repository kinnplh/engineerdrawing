/**
 * Created by lixin on 2016/10/3.
 */

var express = require('express');
var router = express.Router();
var project = require("../dataBase/model/project");
var submit = require("../dataBase/model/submit");
router.get('/', function (req, res, next) {
    var projectId = req.query.projectId;
    project.findById(projectId).populate('submitBox').exec(function (err, retPrj) {
        res.render('submit',{submitList: retPrj.submitBox.reverse(), pathNav: [{name: retPrj.projectName, link: "/project?projectId="+retPrj._id},

            {name: "submitList", link: "/submit?projectId="+retPrj._id}]});
    });
});
router.get('/detail', function (req, res, next) {
    var submitId = req.query.submitId;
    submit.findById(submitId).populate('project').exec(function (err, sbmt) {
        res.render('file',{
            simulatem: sbmt.stdMsg,
            xtime: sbmt.xtime,
            changelist: JSON.stringify(sbmt.changelist),
            lastlist: JSON.stringify(sbmt.lastlist),
            signalname: JSON.stringify(sbmt.signalname),
            simulationTime: sbmt.simulationTime,
            pathNav: [{name: sbmt.project.projectName, link: "/project?projectId="+sbmt.project._id},
                {name: "submitList", link: "/submit?projectId="+sbmt.project._id},
                {name: "submitDetails", link: "/submit/detail?submitId="+sbmt._id}]
        });
    });
});
router.get('/homework', function (req, res, next) {
    var prjId = req.query.projectId;
    var hwId = req.query.homeworkId;
    console.log(prjId);
    project.findById(prjId).populate({
        path: 'hwSubmitBox',
        populate: {
            path: 'project',
            populate:{path: 'homework'}
        }
    }).exec(function (err, retPrj) {
        console.log(retPrj.hwSubmitBox[0].project.homework.deadline);
        res.render('homeworkSubmit',{submitList: retPrj.hwSubmitBox.reverse(), pathNav: [{name: retPrj.projectName, link: "/project?projectId="+retPrj._id},
            {name: "homeworkSubmitList", link: "/submit/homework?projectId="+retPrj._id + "&homeworkId=" + hwId}]});
    });
});




module.exports = router;

