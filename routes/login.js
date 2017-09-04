/**
 * Created by kinnplh on 2016/10/3.
 */

var express = require('express');
var router = express.Router();
var user = require('../dataBase/model/user');
var message = require('../dataBase/model/message');
var async = require('async');
router.get('/login', function (req, res) {
    if(res.locals.hasLogin) {
        res.redirect('/');
    }
    else {
        res.render('login', {pathNav : [{link: "/login", name: "login"}]});
    }
});
router.post('/login',function (req, res) {
    var username = req.body.userName;
    var password = req.body.password;
    console.log(username + ' ' + password);
    var result;
    user.findOne({userName:username})
        .populate({
            path: 'homeworkBox',
            populate: {path: "homework"}
        })
        .populate('projectBox')
        .exec(function (err, obj) {
        result = obj;
        var errorMsg = "";
        //console.log(result);
        if(result == null)
            errorMsg = "No such user.";
        else if(result.password != password)
            errorMsg = "Permission denied.";
        if(errorMsg.length != 0)
            res.render('login', {errMsg: errorMsg});
        else {
            req.session.user = {
                userName: obj.userName,
                _id: obj._id,
                password: obj.password,
                authority: obj.authority
            };
            res.locals.hasLogin = true;
            res.locals.user = req.session.user;
            if(obj.authority == 0)
                res.render('index',{title: "Index", projectList: obj.projectBox, homeworkList: obj.homeworkBox });
            else
                res.redirect('/admin');
        }
    });
});
router.get('/logout', function (req, res) {
    req.session = null;
    res.redirect('/');
});

module.exports = router;