var express = require('express')
var router = express.Router();
var mongoose = require('mongoose')
var jwt = require('jsonwebtoken')

var Models = require('../models/ScheduleModels.js')
var Account = require('../models/Account.js');

var Period = Models.Period
var Day = Models.Day
var DayType = Models.DayType

var config = require('../config.js');
var secret = config.secret;

var passport = require('passport')
var LocalStrategy = require('passport-local')

router.use(passport.initialize());

passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

/*******************************
 * Unauthenticated routes
 * ****************************/

router.get('/', function(req, res) {
        res.json('API OK');
});
/*
router.get('/day_type', function(req, res, next) {
        var today = moment().hours(6).minutes(0).seconds(0).milliseconds(0).utc();
        DayType.findOne({date: today.toDate()}, function(error,results){
                res.json(results);
        });
});
*/

router.get('/day_type', function(req, res, next) {
        var date = req.query.date;
        if(!date || date == "now") date = moment().hours(6).minutes(0).seconds(0).milliseconds(0).utc();
        console.log(date);
        DayType.findOne({date: date}, function(err, queryResult) {
                if (err) res.status('400').send({
                        error: "Invalid query"
                });
                if(queryResult){
                    res.json({date: queryResult.date, type: queryResult.type});
                } else {
                    res.json(400, {error:"Invalid date format"});
                }
        });
});

router.get('/period', function(req, res) {
        var day = new Date(req.query.date);
        if(day == "Invalid Date") {
                res.status('400').send({
                        error: "Invalid date format"
                });
        }
        day.setHours(6);
        Period.find({day:day.toISOString()}, function(error, result) {
                if(error) res.status('400').send({
                        error: "Invalid query"
                });
                res.json(result);
        });

});

router.post('/register', function(req, res) {
        Account.register(new Account({ username:req.body.username, userType:"User"}), req.body.password, function(err, account) {
                if(err) {
                        return res.json({message:'Error creating account', account: account});
                }

                var token = jwt.sign({account: account}, secret, {
                        expiresIn: "365 days"
                });

                res.json({message:'Account created', token:token});
        });
});

router.post('/get-token', function(req, res) {
        Account.findOne({username:req.body.username}, function(err, account) {
                if(err) {
                        res.json(400, {error: 'User not found'});
                }

                var token = jwt.sign({account: account}, secret, {
                        expiresIn: "365 days"
                });

                passport.authenticate('local')(req, res, function() {
                        res.json({
                                message: 'Here is your token',
                                token: token
                        });
                });

        });
});

//Auth

router.use(function(req, res, next) {
        var token = req.body.token || req.query.token || req.headers['x-access-token']
        if(token) {
                jwt.verify(token, secret, function(err, decoded) {
                        if(err) {
                                res.json({success:false, message:'Invalid token'});
                        } else {
                                req.decoded = decoded;
                                next();
                        }
                });
        } else {
                res.status(403).send({
                        success: false,
                        message: 'No token provided'
                });
        }
});

/********************************
 * Authenticated Routes
 * ******************************/


router.post('/period', function(req,res){
        var userType = req.decoded.account.userType;
        if(userType == "Admin") {
                DayType.findOne({date:new Date(req.body.day)}, function(error, result){
                        var poster = {
                                day: new Date(req.body.day),
                                start_time: new Date(req.body.start_time),
                                end_time: new Date(req.body.end_time),
                                title: req.body.title,
                                linked_day: result._id
                        };
                        Period.create(poster, function(err, post){
                                if(err) res.json("error");
                                res.json(post);
                        });   
                });
        } else {
                res.json(401, {"message": "You do not have permission to perform that action"});
        }                       
});

router.post('/day_type', function(req,res){
        var userType = req.decoded.account.userType;
        if(userType == "Admin") {
                var date = moment(req.body.date).hours(6).utcOffset(-6).format();
                DayType.create({
                        'date': date,
                        'type': req.body.type
                },
                function(err,post){
                        if(err) res.json("error");
                        res.json(post);
                });
        } else {
                res.json(401, {"message": "You do not have permission to perform that action"});
        }                       
});

router.get('/auth-test', function(req, res) {
        res.json('Authentication successful!');
});

module.exports = router;
