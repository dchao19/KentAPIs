var express = require('express')
var router = express.Router();
var mongoose = require('mongoose')
var jwt = require('jsonwebtoken')
var moment = require('moment')
var timezone = require('moment-timezome')

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
        var date;
        if(req.query.date == "now") 
                date = moment().tz('America/Denver').hours(6).minutes(0).seconds(0).milliseconds(0).utc();
        else 
                date = moment(new Date(req.query.date));
        console.log(date);
        console.log(date.toISOString());
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

router.get('/all_periods', function(req, res) {
        var date;
        if(req.query.date == "now") 
                date = new Date(moment().hours(6).minutes(0).seconds(0).milliseconds(0).utc());
        else 
                date = new Date(req.query.date);
        if(date == "Invalid Date") {
                res.status('400').send({
                        error: "Invalid date format"
                });
        }
        date.setHours(6);
        console.log(date.toISOString());
        Period.find({day:date.toISOString()}, function(error, result) {
                if(error) res.status('400').send({
                        error: "Invalid query"
                });
                pretty_result = [];
                for(var i in result) {
                        period = result[i];
                        pretty_result.push({
                                title:period.title, 
                                start_time:period.start_time, 
                                end_time:period.end_time,
                                day:period.day
                        });
                }
                pretty_result.sort(function(a, b) {
                        return (new Date(a.start_time)).getTime() - (new Date(b.start_time)).getTime();
                });
                res.json(200, pretty_result);
        });

});

router.get('/period', function(req, res) {
        var date;
        if(req.query.date == "now") 
                date = new Date();
        else 
                date = new Date(req.query.date);
        if(date == "Invalid Date") {
                res.status('400').send({
                        error: "Invalid date format"
                });
        }
        Period.findOne({
                $and:[
                {start_time:{$lte:date.toISOString()}}, 
                {end_time:{$gte:date.toISOString()}}
                ]}, function(error, result) {
                        if(error) res.status('400').send({
                                error: "Invalid query"
                        });
                        period = result;
                        pretty_result = {
                                title:period.title, 
                                start_time:period.start_time, 
                                end_time:period.end_time,
                                day:period.day
                        }
                        res.json(200, pretty_result);
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
                var date = moment(req.body.date).tz('America/Denver').hours(6).minutes(0).seconds(0).milliseconds(0).utc();
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
