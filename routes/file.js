/**
 * Created by lixin on 2016/10/3.
 */

var express = require('express');
var router = express.Router();
var modelsim = require('./modelsim.js');
router.get('/', function (req, res, next) {
    res.render('file',{simulatem:modelsim.getsimulateMsg(),xtime:modelsim.getxtime(),changelist:modelsim.getchangelist(),lastlist:modelsim.getlastlist(),signalname:modelsim.getsignalname()});
    console.log(modelsim.getxtime());
    console.log(modelsim.getchangelist());
    console.log(modelsim.getlastlist());
});


module.exports = router;

