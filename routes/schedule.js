var express = require('express')
var router = express.Router();
var mongoose = require('mongoose')
var jwt = require('jsonwebtoken')
var moment = require('moment')
var timezone = require('moment-timezone')

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

/**
* @api {get} schedule/ API Status
* @apiName APIStatus
* @apiGroup Schedule
* @apiSuccess {String} message API OK
* @apiSuccessExample Success-Response:
*   API OK
*/

router.get('/', function(req, res) {
        res.json({"message": "API OK"});
});


/**
* @api {get} schedule/day_type Day Type (Letterday)
* @apiName "DayType"
* @apiDescription This endpoint returns the letter day of a given date, or now if none specified.
* @apiGroup Schedule
* @apiParam {String} date=now an ISO 8061 date string
* @apiSuccess {String} date Date in ISO8061 Format, UTC time
* @apiSuccess {String} type Letter Day
* @apiError 400 The date query was formatted incorrectly or is an invalid range. 
* @apiSuccessExample {json} Success-Response:
*   {
*       "date": "2016-02-26T13:00:00.000Z",
*       "type": "A"
*   }
* @apiErrorExample {json} Error-Response:
*   HTTP/1.1 400 Bad Request
*   {
*       "error": "Invalid date format"    
*   }
*/
router.get('/day_type', function(req, res, next) {
        var date;
        if(req.query.date == "now" || req.query.date == undefined) 
                date = moment().tz('America/Denver').hours(6).minutes(0).seconds(0).milliseconds(0).utc();
        else { 
                date = moment(req.query.date)
                var tempDate = moment(req.query.date)
                date.tz('America/Denver').hours(6).minutes(0).seconds(0).milliseconds(0);
                date.date(tempDate.date());
        }
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
/**
* @api {get} schedule/all_periods All Periods
* @apiName "All_Periods"
* @apiDescription This endpoint returns an array of all of the periods in a date, or today if none is specified.
* @apiGroup Schedule
* @apiParam {String} date=now an ISO 8061 date string
* @apiSuccess {Object[]} periods List of periods in a day.
* @apiSuccess {String} periods.title Day Type
* @apiSuccess {String} periods.start_time Start time of period in UTC timezone
* @apiSuccess {String} periods.end_time End time of period in UTC timezone
* @apiSuccess {String} periods.day The period's associated day
* @apiError 400 The date query was formatted incorrectly or is an invalid range. 
* @apiSuccessExample {json} Success-Response:
*   [
*       {
*           "title": "Period 1",
*           "start_time" : "",
*           "end_time": "",
*           "day": ""        
*       },
*       {
*           "title": "Period 3",
*           "start_time" : "",
*           "end_time": "",
*           "day": ""        
*       }
*       ... 
*   ]
* @apiErrorExample {json} Error-Response:
*   HTTP/1.1 400 Bad Request
*   {
*       "error": "Invalid date format"    
*   }
*/
router.get('/all_periods', function(req, res) {
        var date;
        if(req.query.date == "now" || req.query.date == undefined) 
                date = moment().tz('America/Denver').hours(6).minutes(0).seconds(0).milliseconds(0).utc();
        else { 
                date = moment(req.query.date)
                var tempDate = moment(req.query.date)
                date.tz('America/Denver').hours(6).minutes(0).seconds(0).milliseconds(0);
                date.date(tempDate.date());
        }
        if(date == "Invalid Date") {
                res.status('400').send({
                        error: "Invalid date format"
                });
        }
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
/**
* @api {get} schedule/period Period
* @apiName "Period"
* @apiDescription This endpoint returns the current period if no date is specified, or the current period in the specified day
* @apiGroup Schedule
* @apiParam {String} date=now an ISO 8061 date string
* @apiSuccess {String} title Day Type
* @apiSuccess {String} start_time Start time of period in UTC timezone
* @apiSuccess {String} end_time End time of period in UTC timezone
* @apiSuccess {String} day The period's associated day
* @apiError 400 The date query was formatted incorrectly or is an invalid range.
* @apiSuccessExample {json} Success-Example:
*   {
*       "title": "Period 1",
*       "start_time": "",
*       "end_time": "",
*       "day": ""
*   }
*/
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
                        if(result) {
                        period = result;
                        pretty_result = {
                                title:period.title, 
                                start_time:period.start_time, 
                                end_time:period.end_time,
                                day:period.day
                        }
                        res.json(200, pretty_result);
                        } else {
                            return res.status(200).json({});
                        }
                });

});
/**
* @api {post} schedule/register Register Account
* @apiName "Register Account"
* @apiDescription This endpoint creates a user account in the database and returns a token.
* @apiGroup Schedule
* @apiParam {String} username Account Username
* @apiParam {String} password Account Password
* @apiSuccess {String} message Creation status
* @apiSuccess {String} token User token
* @apiSuccessExample {json} Success-Response:
*   {
*       "message": "Account created",
*       "token": "<USER_TOKEN>"
*   }
*/
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
/**
* @api {post} schedule/get-token GetToken
* @apiName "Get Token"
* @apiDescription This endpoint returns a user's token after authentication.
* @apiGroup Schedule
* @apiParam {String} username Account Username
* @apiParam {String} password Account Password
* @apiSuccess {String} message Token retrieval statusp
* @apiSuccess {String} token User token
* @apiError 400 The user with the given username/password does not exist.
* @apiSuccessExample {json} Success-Response:
*   {
*       "message": "Here is your token",
*       "token": "<USER_TOKEN>" 
*   }
*/
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
                DayType.findOne({date:req.body.day.toString()}, function(error, result){
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
