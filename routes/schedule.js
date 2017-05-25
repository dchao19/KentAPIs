var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var jwt = require('jsonwebtoken');
var moment = require('moment');
var timezone = require('moment-timezone');

var Models = require('../models/ScheduleModels.js');
var Account = require('../models/Account.js');

var Period = Models.Period;
var Day = Models.Day;
var DayType = Models.DayType;

var config = require('../config.js');
var secret = config.secret;

var passport = require('passport');
var LocalStrategy = require('passport-local');

var periodTitleList = [];

router.use(passport.initialize());

passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

/*
 *  Create list of periods
 */

function updatePeriodList() {
    console.log('Updating periods');
    Period.distinct('title', {}, function(err, titleList) {
        periodTitleList = titleList;
    });
}
updatePeriodList();
setInterval(updatePeriodList, 20*60*1000);

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

    if(!date.isValid()) {
        return res.status(400).send({
            success: false,
            error: "Unable to parse date provided in request"
        });
    }

    DayType.findOne({date: date.toISOString()}, '-_id -__v', function(err, day) {
        if(err) {
            return res.status(500).send({
                success: false,
                error: "Internal server error"
            });
        }

        if (day) {
            return res.send(day);
        }

        return res.send({
            date: "No school",
            type: "X"
        });
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
 *           "day": ""
 *           "start_time" : "",
 *           "end_time": "",
 *           "title": "Period 1",
 *       },
 *       {
 *           "day": ""
 *           "start_time" : "",
 *           "end_time": "",
 *           "title": "Period 3",
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
    var date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
        moment().hours(6).minutes(0).seconds(0).milliseconds(0).utc() :
        moment(req.query.date).hours(6).minutes(0).seconds(0).milliseconds(0).utc();

    if(!date.isValid()) {
        return res.status(400).send({
            success: false,
            error: "Unable to parse date provided in request"
        });
    }
    Period.find({day: date.toISOString()},'-linked_day -_id -__v', function(error, periods) {
        if (error) res.status(500).send({
            success: false,
            error: "Internal server error"
        });
        periods.sort(function (a, b) {
            return (new Date(a.start_time)).getTime() - (new Date(b.start_time)).getTime();
        });
        res.json(200, periods);
    });

});
/**
 * @api {get} schedule/period Period
 * @apiName "Period"
 * @apiDescription This endpoint returns the current period if no date is specified, or the period at the specified date and time. If no period exists, an empty object will be returned.
 * @apiGroup Schedule
 * @apiParam {String} date=now an ISO 8061 date string
 * @apiSuccess {String} title Day Type
 * @apiSuccess {String} start_time Start time of period in UTC timezone
 * @apiSuccess {String} end_time End time of period in UTC timezone
 * @apiSuccess {String} day The period's associated day
 * @apiError 400 The date query was formatted incorrectly or is an invalid range.
 * @apiSuccessExample {json} Success-Example:
 *   {
 *       "day": ""
 *       "start_time": "",
 *       "end_time": "",
 *       "title": "Period 1",
 *   }
 */
router.get('/period', function(req, res) {
    var date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
        moment() :
        moment(req.query.date);

    if(!date.isValid()) {
        return res.status(400).send({
            success: false,
            error: "Unable to parse date provided in request"
        });
    }
    Period.findOne(
        {
            $and:[
                {start_time:{$lte:date.toISOString()}}, //Now "is a period" if the time is in between the start/end time of a period
                {end_time:{$gte:date.toISOString()}}
            ]
        },
        '-linked_day -_id -__v',
        function(error, period) {
            if (error) res.status(500).send({
                success: false,
                error: "Internal server error"
            });
            if(period) {
                res.json(200, period);
            } else {
                return res.status(200).json({});
            }
        });
});
/**
 * @api {get} schedule/next_occurrence Next Occurance
 * @apiName "Next Occurrence"
 * @apiDescription This endpoint returns the next occurrence(s) of a specified day type or period (not including the current occurrence, if applicable).
 * @apiGroup Schedule
 * @apiParam (Required) {String="day_type","period"} type A string specifying the type of requested resource
 * @apiParam (Required) {String} identifier A string specifying the type of requested resource e.g "A", "Period 1", "Advisory Office Hours"
 * @apiParam  {Number} maxResults=1 the maximum number of future occurrences to be returned
 * @apiParam {String} date an ISO 8061 date string to search forward from
 * @apiSuccess {Object[]} periods List of periods if type is "period"
 * @apiSuccess {String} periods.title Day Type
 * @apiSuccess {String} periods.start_time Start time of period in UTC timezone
 * @apiSuccess {String} periods.end_time End time of period in UTC timezone
 * @apiSuccess {String} periods.day The period's associated day
 * @apiSuccess {Object[]} days List of days if type is "day_type"
 * @apiSuccess {String} days.date Date in ISO8061 Format, UTC time
 * @apiSuccess {String} days.type Letter Day
 * @apiError 400 A type or identifier is missing or invalid
 * @apiSuccessExample {json} Success-Example:
 *   [
 *       {
 *           "day": ""
 *           "start_time" : "",
 *           "end_time": "",
 *           "title": "Period 1",
 *       },
 *       {
 *           "day": ""
 *           "start_time" : "",
 *           "end_time": "",
 *           "title": "Period 3",
 *       }
 *       ...
 *   ]
 *
 *   OR
 *
 *   [
 *      {
 *           "date": "2016-02-26T13:00:00.000Z",
 *           "type": "A"
 *       },
 *       {
 *           "date": "2016-02-27T13:00:00.000Z",
 *           "type": "B"
 *       }
 *       ...
 *   ]
 */
router.get('/next_occurrence', function(req, res) {
    var type = req.query.type;
    var identifier = req.query.identifier;
    var validType = type && (type === 'day_type' || type === 'period');
    var validIdentifier = identifier && (identifier >= "A" && identifier <= "G" || periodTitleList.includes(identifier));
    if(!validType || !validIdentifier) {
        return res.status(400).send({
            success: false,
            error: "A type or identifier is missing or invalid"
        });
    }
    var maxResults = !Number.isNaN(parseInt(req.query.maxResults)) ? parseInt(req.query.maxResults) : 1;
    var date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
        moment() :
        moment(req.query.date);

    if(type === 'period') {
        Period.find(
            {
                title: identifier,
                start_time: {$gte: date}
            }
        ).select('-linked_day -_id -__v').limit(maxResults).exec(function(error, periods) {
            if (error) res.status(500).send({
                success: false,
                error: "Internal server error"
            });
            res.json(200, periods);
        });
    }
    if(type === 'day_type') {
        DayType.find(
            {
                type: identifier,
                date: {$gte: date}
            }
        ).select('-linked_day -_id -__v').limit(maxResults).exec(function(error, days) {
            if (error) res.status(500).send({
                success: false,
                error: "Internal server error"
            });
            res.json(200, days);
        });
    }

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
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
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
