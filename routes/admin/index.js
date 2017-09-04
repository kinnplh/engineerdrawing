/**
 * Created by kinnplh on 10/18/16.
 */
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
   res.render('admin/index');
});

router.get('/detail', function (req, res, next) {
   res.json({
      status: "TBC"
   });
});


module.exports = router;