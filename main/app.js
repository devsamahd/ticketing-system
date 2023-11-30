var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const LogProducer = require('./producers/logProducer');

const logProducer = new LogProducer
var app = express();

app.use(async(req, res, next)=>{
    await logProducer.publishLog('log', {url:req.url, method: req.method})
    next()
})
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.listen(8088, ()=>{
    console.log("listening on port 8088")
})
