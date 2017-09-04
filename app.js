/* global __dirname */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var login = require("./routes/login");
var index = require('./routes/index');
var users = require('./routes/users');
var editor = require('./routes/editor');
var submit = require('./routes/submit');
//var routes = require('./routes/index');
var canvas = require('./routes/canvas');
var cpu = require('./routes/cpu');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var project = require('./routes/project');
var adminIndex = require('./routes/admin/index');
var adminTable = require('./routes/admin/table');
var createHomework = require('./routes/admin/createHomework');
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('ExprOnline'));
app.use(cookieSession({
    name: 'umi',
    keys: ['key1']
}));
app.use(function(req, res, next){
    console.log(req.session);
    console.log("=======");
    if(req.session.user){
        res.locals.user = req.session.user;
        res.locals.hasLogin = true;
        res.locals.project = req.session.project;
        res.locals.newHw = req.session.newHw;
    }else{
        res.locals.user = undefined;
        res.locals.hasLogin = false;
        res.locals.project = undefined;
        res.locals.newHw = undefined;
    }
    //console.log("appjs  res.locals.hasLogin: " + res.locals.hasLogin);
    next();
});

app.use('/', index);
app.use('/users', users);
app.use('/canvas', canvas);
app.use('/cpu', cpu);
app.use('/submit', submit);


//app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));
app.use('/', index);
app.use('/users', users);
app.use('/', login);
app.use('/', project);
app.use('/editor', editor);
app.use('/admin', adminIndex);
app.use('/admin', adminTable);
app.use('/admin', createHomework);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
app.post('/file/uploading', multipartMiddleware,function(req, res, next) {
    console.log(req.body);
    console.log(req.files);
});

module.exports = app;
