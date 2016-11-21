var express = require('express')
var router = express.Router();
var mongoose = require('mongoose')
var jwt = require('jsonwebtoken')
var moment = require('moment')
var timezone = require('moment-timezone')
var async = require('async');

var Models = require('../models/ScheduleModels.js')
var Account = require('../models/Account.js');

var Period = Models.Period
var Day = Models.Day
var DayType = Models.DayType

var config = require('../config.js');
var secret = config.secret;

var passport = require('passport')
var LocalStrategy = require('passport-local')

var authUtils = require('../utils/auth.js');

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
    var date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
        moment().hours(6).minutes(0).seconds(0).milliseconds(0).utc() :
        moment(req.query.date).hours(6).minutes(0).seconds(0).milliseconds(0).utc();

    DayType.findOne({date: date}, function(err, day) {
        if(err) {
            return res.status(500).send({
                success: false,
                error: "Internal server error"
            });
        }

        return res.send({
            date: day.date,
            type: date.type
        });
    });
});
/**
* @api {get} schedule/all_periods All Periods
* @apiName "All_Periods"
* @apiDescription This endpoint returns an array of all of the periods in a date, or today if none is specified.
* @apiGroup Schedule
* @apiHeader {String} [X-Access-Token] User's unique access token
* @apiParam {String} date=now an ISO 8061 date string
* @apiSuccess {Object[]} periods List of periods in a day.
* @apiSuccess {String} periods.title The period number or the user's name for the period provided X-Access-Token was set and the period has been named.
* @apiSuccess {String} periods.start_time Start time of period in UTC timezone
* @apiSuccess {String} periods.end_time End time of period in UTC timezone
* @apiSuccess {String} periods.day The period's associated day
* @apiError 400 The date query was formatted incorrectly or is an invalid range.
* @apiSuccessExample {json} Success-Response:
*   [
*       {
*           "title": "English",
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
router.get('/all_periods', authUtils.nonStrictAuthentication, function(req, res) {
    var date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
        moment().hours(6).minutes(0).seconds(0).milliseconds(0).utc() :
        moment(req.query.date).hours(6).minutes(0).seconds(0).milliseconds(0).utc();

    if(!date.isValid()) {
        res.status(400).send({
            success: false,
            error: "Unable to parse date provided in request"
        });
    }
        
    Period.find({day: date.toISOString()},'-linked_day -_id -_v', function(error, periods) {
        if(error) res.status(500).send({
            success: false,
            error: "Internal server error"
        });
        
        result = [];
        async.each(periods, function(period, callback){
            if(req.decoded){
                Account.findOne({username: req.decoded.account.username}, function(err, account){
                    if(err) {
                        return res.status(500).send({
                            success: false,
                            message: "An internal server error has occured."
                        });
                    } else if(!account) {
                        return res.status(404).send({
                            success: false,
                            message: "A user with the given username was not found. Check your token."
                        });
                    } else {
                        period.title = account.classNames[period.title] ? account.classNames[period.title] : period.title;
                        result.push(period);
                        callback();
                    }
                });
            } else {
                result = periods;
                callback();
            }
        }, function(err){
            result.sort(function(a, b) {
                return (new Date(a.start_time)).getTime() - (new Date(b.start_time)).getTime();
            });

            res.json(result);
        });
    });
});
/**
* @api {get} schedule/period Period
* @apiName "Period"
* @apiDescription This endpoint returns the current period if no date is specified, or the current period in the specified day
* @apiGroup Schedule
* @apiHeader {String} [X-Access-Token] User's unique access token
* @apiParam {String} date=now an ISO 8061 date string
* @apiSuccess {String} title The period number or the user's name for the period provided X-Access-Token was set and the period has been named.
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
router.get('/period', authUtils.nonStrictAuthentication, function(req, res) {
    let date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
        moment() :
        moment(req.query.date); //moment date parsing tends to be more flexible, specifically with timezones

    if(!date.isValid()) {
        res.status(400).send({
            success: false,
            error: "Unable to parse date provided in request"
        });
    }

    Period.findOne(
        {
            $and: [
                {start_time: {$lte: date.toISOString()}}, //Now "is a period" if the time is in between the start/end time of a period
                {end_time: {$gte: date.toISOString()}}
            ]
        }, 
        '-linked_day -_id -_v',
        function(error, period) {
            if(error) {
                res.status(500).send({
                    success: false
                });
            } else if(period) {
                //If the user supplied a token that was able to decoded, check for the classNames that might be defined
                if(req.decoded) {
                    Account.findOne({username: req.decoded.account.username}, function(err, account){
                        if(err) res.json(500, {"message": "An internal server error has occured."});
                        else if(!account) res.json(401, {"message": "A user with the given username was not found. Check your token."});
                        else {
                            //If the account has a named period, rename it in the response accordingly
                            period.title = account.classNames[period.title] ? account.classNames[period.title] : period.title;
                            res.send(period);
                        }
                    });
                } else {
                    res.send(period);
                }
            } else {
                res.send({});
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
    Account.register(new Account({username: req.body.username, userType: "User"}), req.body.password, function(err, account) {
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
* @apiSuccess {String} message Token retrieval status
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

router.use(authUtils.strictAuthentication);

/********************************
 * Authenticated Routes
 * ******************************/

router.post('/period', function(req,res){
        var userType = req.decoded.account.userType;
        if (userType == "Admin") {
                DayType.findOne({ date: req.body.day }, function(error, result) {
                        if (error) {
                            return res.status(500).send({
                                success: false
                            });
                        } else if (result) {
                                var newPeriod = new Period({
                                        day: new Date(req.body.day),
                                        start_time: new Date(req.body.start_time),
                                        end_time: new Date(req.body.end_time),
                                        title: req.body.title,
                                        linked_day: result._id
                                });
                                newPeriod.save((err, result) => {
                                    if (err) {
                                        return res.status(500).send({
                                            success: false
                                        });
                                    }

                                    return res.send({
                                        period: newPeriod
                                    });
                                });
                        }
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
/**
* @api {get} schedule/name_period Name Period
* @apiName "Name Period"
* @apiDescription This endpoint associates a period number with a user-specifice dname.
* @apiGroup Schedule
* @apiParam {String} period Period number to replace (ex. "Period 1")
* @apiParam {String} periodName Name for the period.
* @apiSuccess {String} message Success message
* @apiError 400 The user with the given username does not exist.
* @apiError 500 An internal server error has occured
* @apiSuccessExample {json} Success-Response:
*   {
*       "message": "success"
*   }
*/
router.get('/name_period', function(req,res){
    Account.findOne({"username": req.decoded.account.username}, function(err, account){
        if(err) res.json(500, {"message": "An internal server error has occured"});
        else if(!account) res.json(401, {"message": "No user with the given username could be found."});
        else {
            if(account.classNames === undefined) {
                account.classNames = {};
            }
            account.classNames[req.query.period] = req.query.periodName;
            account.markModified('classNames');
            account.save();

            res.send({"message": "success"});
        }
    });
});


router.get('/auth-test', function(req, res) {
        res.json('Authentication successful!');
});

module.exports = router;
