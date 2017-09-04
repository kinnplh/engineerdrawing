/**
 * Created by claud on 2016/10/2.
 */
var express = require('express');
var router = express.Router();
var logger = require('../logconfig');
var c74s = require('../chipInfo/c74s');
var cpu_comps = require('../chipInfo/cpu_comps');
// 最好把芯片信息放在数据库或者某个非public的文件夹中，由express的router传进来
// 而不是像现在这样直接读JS文件

logger.info('canvas router says hey');
/* GET home page. */
router.get('/', function(req, res) {

    res.render('canvas', {
        c74s: c74s
    });
});

module.exports = router;
