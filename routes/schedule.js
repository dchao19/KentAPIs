const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const jwt = require('jsonwebtoken');
const moment = require('moment');
const timezone = require('moment-timezone');

const Models = require('../models/ScheduleModels.js');
const Account = require('../models/Account.js');

const Period = Models.Period;
const DayType = Models.DayType;

const config = require('../config.js');
const secret = config.secret;

const passport = require('passport');
const LocalStrategy = require('passport-local');

let periodTitleList = [];

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
 * @apiVersion 1.0.0
 * @apiSuccess {String} message API OK
 * @apiSuccessExample Success-Response:
 *   {
 *      "message": "API OK"
 *   }
 */

router.get('/', function(req, res) {
    res.json({"message": "API OK"});
});


/**
 * @api {get} schedule/day_type Day Type (Letterday)
 * @apiName "DayType"
 * @apiDescription This endpoint returns the letter day of a given date, or now if none specified. The day_type will be an X if there is no school
 * @apiGroup Schedule
 * @apiVersion 1.0.0
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
router.get('/day_type', function(req, res) {
    let  date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
        moment().tz('America/Denver').hours(6).minutes(0).seconds(0).milliseconds(0).utc() :
        moment(req.query.date).tz('America/Denver').hours(6).minutes(0).seconds(0).milliseconds(0).utc();

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
            date: date,
            type: "X"
        });
    });

});
/**
 * @api {get} schedule/:school/all_periods All Periods
 * @apiName "All_Periods"
 * @apiDescription This endpoint returns an array of all of the periods in a date, or today if none is specified.
 * @apiGroup Schedule
 * @apiVersion 1.0.0
 * @apiParam {String="US","MS"} school="US" School calendar to use
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
router.get('/:school/all_periods', function(req, res) {
    let  date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
        moment().tz('America/Denver').hours(6).minutes(0).seconds(0).milliseconds(0).utc() :
        moment(req.query.date).tz('America/Denver').hours(6).minutes(0).seconds(0).milliseconds(0).utc();
    let school = req.params.school ? req.params.school : "US";
    school = school.toUpperCase();
    if(!date.isValid()) {
        return res.status(400).send({
            success: false,
            error: "Unable to parse date provided in request"
        });
    }
    Period.find({day: date.toISOString(), school:school},'-linked_day -_id -__v', function(error, periods) {
        if (error) res.status(500).send({
            success: false,
            error: "Internal server error"
        });
        periods.sort(function (a, b) {
            return (new Date(a.start_time)).getTime() - (new Date(b.start_time)).getTime();
        });
        res.json(periods);
    });

});
/**
 * @api {get} schedule/:school/period Period
 * @apiName "Period"
 * @apiDescription This endpoint returns the current period if no date is specified, or the period at the specified date and time. If no period exists, an empty object will be returned.
 * @apiGroup Schedule
 * @apiVersion 1.0.0
 * @apiParam {String="US","MS"} school="US" School calendar to use
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
router.get('/:school/period', function(req, res) {
    let  date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
        moment().tz('America/Denver') :
        moment(req.query.date).tz('America/Denver');
    let school = req.params.school ? req.params.school : "US";
    school = school.toUpperCase();
    if(!date.isValid()) {
        return res.status(400).send({
            success: false,
            error: "Unable to parse date provided in request"
        });
    }
    Period.findOne(
        {
            school: school,
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
                res.json(period);
            } else {
                return res.status(200).json({});
            }
        });
});
/**
 * @api {get} schedule/:school/next_occurrence Next Occurence
 * @apiName "Next Occurrence"
 * @apiDescription This endpoint returns the next occurrence(s) of a specified day type or period (not including the current occurrence, if applicable).
 * @apiGroup Schedule
 * @apiVersion 1.0.0
 * @apiParam {String="US","MS"} school="US" School calendar to use
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
 *           "school": "US",
 *           "linked_day": [
 *              "type": "A"
 *           ]
 *       },
 *       {
 *           "day": ""
 *           "start_time" : "",
 *           "end_time": "",
 *           "title": "Period 1",
 *           "school": "US",
 *           "linked_day": [
 *              "type": "B"
 *           ]
}
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
 *           "type": "A"
 *       }
 *       ...
 *   ]
 */
router.get('/:school/next_occurrence', function(req, res) {
    let  type = req.query.type;
    let  identifier = req.query.identifier;
    let  validType = type && (type === 'day_type' || type === 'period');
    let  validIdentifier = identifier && (identifier >= "A" && identifier <= "G" || periodTitleList.includes(identifier));
    let school = req.params.school ? req.params.school : "US";
    school = school.toUpperCase();
    if(!validType || !validIdentifier) {
        return res.status(400).send({
            success: false,
            error: "A type or identifier is missing or invalid"
        });
    }
    let  maxResults = !Number.isNaN(parseInt(req.query.maxResults)) ? parseInt(req.query.maxResults) : 1;
    let  date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
        moment().tz('America/Denver') :
        moment(req.query.date).tz('America/Denver');

    if(type === 'period') {
        Period.find(
            {
                title: identifier,
                start_time: {$gte: date},
                school: school
            }
        ).populate({path: 'linked_day', select:'type -_id'}).select('-_id -__v').sort({start_time: 1}).limit(maxResults).exec(function(error, periods) {
            if (error) res.status(500).send({
                success: false,
                error: "Internal server error"
            });
            res.json(periods);
        });
    }
    if(type === 'day_type') {
        DayType.find(
            {
                type: identifier,
                date: {$gte: date}
            }
        ).select('-linked_day -_id -__v').sort({date: 1}).limit(maxResults).exec(function(error, days) {
            if (error) res.status(500).send({
                success: false,
                error: "Internal server error"
            });
            res.json(days);
        });
    }

});
/**
 * @api {post} schedule/register Register Account
 * @apiName "Register Account"
 * @apiDescription This endpoint creates a user account in the database and returns a token.
 * @apiGroup Schedule
 * @apiVersion 1.0.0
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

        let  token = jwt.sign({account: account}, secret, {
            expiresIn: "365 days"
        });

        res.json({message:'Account created', token:token});
    });
});
/**
 * @api {post} schedule/get_token GetToken
 * @apiName "Get Token"
 * @apiDescription This endpoint returns a user's token after authentication.
 * @apiGroup Schedule
 * @apiVersion 1.0.0
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
router.post('/get_token', function(req, res) {
    Account.findOne({username:req.body.username}, function(err, account) {
        if(err) {
            res.json(400, {error: 'User not found'});
        }

        let  token = jwt.sign({account: account}, secret, {
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
    let  token = req.body.token || req.query.token || req.headers['x-access-token'];
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
    let  userType = req.decoded.account.userType;
    if(userType === "Admin") {
        DayType.findOne({date:req.body.day.toString()}, function(error, result){
            if(!result) { console.log(req.body.day.toString())}
            let  poster = {
                day: new Date(req.body.day),
                start_time: new Date(req.body.start_time),
                end_time: new Date(req.body.end_time),
                title: req.body.title,
                linked_day: result._id,
                school: req.body.school
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
    let  userType = req.decoded.account.userType;
    if(userType === "Admin") {
        let  date = moment(req.body.date).tz('America/Denver').hours(6).minutes(0).seconds(0).milliseconds(0).utc();
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

router.get('/auth_test', function(req, res) {
    res.json('Authentication successful!');
});

module.exports = router;
