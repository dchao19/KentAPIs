const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const timezone = require('moment-timezone');
const async = require('async');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const Models = require('../models/ScheduleModels.js');
const Account = require('../models/Account.js');

const Period = Models.Period;
const Day = Models.Day;
const DayType = Models.DayType;

const config = require('../config.js');
const secret = config.secret;

const passport = require('passport');
const LocalStrategy = require('passport-local');

function ensureLoggedIn(loginUrl) {
    return function(req, res, next) {
        if (!req.session.passport) {
            return res.redirect(loginUrl);
        }
        next();
    }
}

module.exports = function(connection) {

    router.use(passport.initialize());

    router.use(session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongooseConnection: connection })
    }));
    router.use(passport.session());

    passport.use(new LocalStrategy(Account.authenticate()));
    passport.serializeUser(Account.serializeUser());
    passport.deserializeUser(Account.deserializeUser());



    function genericContext() {
        return {
            static_path: '/static',
            display_title: 'ER MAH GERD',
            title: 'yup, so pro'
        };
    }

//Auth

    router.get('/login', function (req, res) {
        return res.render('login');
    });

    router.post('/login', function (req, res, next) {
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.render('login', {error_message: info.message});
            }
            if (user.userType !== "Admin") {
                return res.render('login', {error_message: "You must be an admin to access this page."});
            }
            req.login(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.redirect('/admin/days');
            });
        })(req, res, next);
    });



    router.get('/days', ensureLoggedIn('/admin/login'), function (req, res) {
        let date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
            moment() :
            moment(req.query.date);

        let num_days = (typeof req.query.num_days === 'undefined') ? 12 : parseInt(req.query.num_days);

        if (!date.isValid()) {
            return res.json(400, {
                success: false,
                error: "Unable to parse date provided in request"
            });
        }

        DayType.find({date: {$gte: date}}).select({
            date: 1,
            type: 1
        }).limit(num_days).sort({date: 1}).exec(function (err, days) {
            if (err) {
                return res.json(500, {
                    success: false,
                    error: "An error occurred. Good luck."
                })
            } else {
                // TODO return render days
                ctx = genericContext();
                ctx.days = days;
                return res.render('days', ctx);
                // days: [{date, type}]
            }
        })

    });

    router.get('/day', ensureLoggedIn('/admin/login'), function (req, res) {
        let date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
            moment().hours(6).minutes(0).seconds(0).milliseconds(0).utc() :
            moment(req.query.date).hours(6).minutes(0).seconds(0).milliseconds(0);

        if (!date.isValid()) {
            res.json(400, {
                success: false,
                error: "Unable to parse date provided in request"
            });
        }

        Period.find({day: date.toISOString()}).select({
            start_time: 1,
            end_time: 1,
            title: 1,
            day: 1
        }).sort({start_time: 1}).exec(function (err, periods) {
            if (err) return res.json(500, {yes: "Lol. Good Smert."});
            // TODO return render periods
            return res.render('periods', {periods: periods, day: date});
            // periods: [period]
        });
    });

    router.get('/period', ensureLoggedIn('/admin/login'), function (req, res) {
        let date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
            moment() :
            moment(req.query.date);
        if (!date.isValid()) {
            res.json(400, {
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
            '-linked_day -_id -__v',
            function (err, period) {
                if (err || !period) return res.json(500, {
                    success: false,
                    error: "Oops. I'm sorry. Alex is sorry."
                });

                return res.render('period', {period: period});
                // period: {day, start_time, end_time, title};
            });

    });

    router.post('/update_period', ensureLoggedIn('/admin/login'), function (req, res) {
        // Change period number, start/end time
        // Or, if no date if found, creates a new one
        let date = (typeof req.body.date === 'undefined') ? false : req.body.date;
        if (!date) return res.json(400, {success: false, error: "No date provided"});
        let m_date = moment(date);
        if (!m_date.isValid()) return res.json(400, {success: false, error: "Invalid date provided"});

        let start_time = req.body.start_time;
        let end_time = req.body.end_time;
        let period_name = req.body.period_name;
        if (typeof start_time === 'undefined' || typeof end_time === 'undefined' || typeof period_name === 'undefined') {
            return res.json(400, {success: false, error: "Missing period information"});
        }
        let m_start_time = moment(start_time);
        let m_end_time = moment(end_time);
        if (!(m_start_time.isValid() || m_end_time.isValid())) {
            return res.json(400, {success: false, error: "Invalid times provided."});
        }

        Period.findOneAndUpdate(
            {day: m_date},
            {$set: {start_time: start_time}, $set: {end_time: end_time}, $set: {title: period_name}},
            {upsert: true},
            function (err, period) {
                if (err) return res.json(500, {success: false, error: "I am not good with computer"});
                else return res.json(200, {success: true, msg: "Updated period!"});
            });
    });

    router.post('/delete_period', ensureLoggedIn('/admin/login'), function (req, res) {
        // Delete a period
        let date = (typeof req.body.date === 'undefined') ? false : req.body.date;
        if (!date) return res.json(400, {success: false, error: "No date provided"});
        let m_date = moment(date);
        if (!m_date.isValid()) return res.json(400, {success: false, error: "Invalid date provided"});
        Period.findOneAndRemove({day: m_date}, function (err) {
            if (err) return res.json(500, {success: false, error: "Could not remove day"});
            else return res.json(200, {success: true, msg: "Removed period!"});
        })
    });


    router.post('/delete_day', ensureLoggedIn('/admin/login'), function (req, res) {
        // delete a day

        // should delete associated periods? TODO

        let date = (typeof req.body.date === 'undefined') ? false : req.body.date;
        if (!date) return res.json(400, {success: false, error: "No date provided"});
        let m_date = moment(date);
        if (!m_date.isValid()) return res.json(400, {success: false, error: "Invalid date provided"});
        m_date = m_date.hours(6).minutes(0).seconds(0).milliseconds(0).utc();

        DayType.findOneAndRemove({date: m_date}, function (err) {
            if (err) return res.json(500, {success: false, error: "Could not remove day"});
            else {
                Period.remove({day: m_date}, function (err) {
                    if (err) return res.json(500, {success: false, error: "Could not remove associated periods"});
                    else return res.json(200, {success: true, msg: "Crushed it!"});
                })
            }
        })
    });

    router.post('/update_day', ensureLoggedIn('/admin/login'), function (req, res) {
        // update a day's day type
        // or, if the day is not found, make it
        let date = (typeof req.body.date === 'undefined') ? false : req.body.date;
        if (!date) return res.json(400, {success: false, error: "No date provided"});
        let m_date = moment(date);
        if (!m_date.isValid()) return res.json(400, {success: false, error: "Invalid date provided"});
        m_date = m_date.hours(6).minutes(0).seconds(0).milliseconds(0).utc();

        let type = (typeof req.body.day_type === 'undefined') ? false : req.body.type;
        if (!type) return res.json(400, {sucess: false, error: "No day type provided"});

        DayType.findOneAndUpdate(
            {date: m_date},
            {$set: {date: m_date}, $set: {type: type}},
            {upsert: true},
            function (err, period) {
                if (err) return res.json(500, {success: false, error: "I am not good with computer 2"});
                else return res.json(200, {success: true, msg: "Updated period!"});
            });
    });


    return router;
};