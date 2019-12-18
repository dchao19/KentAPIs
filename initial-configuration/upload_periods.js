const ical = require('ical');
const unirest = require('unirest');
const moment = require('moment');
const config =  require('./config.js');
const timezone = require('moment-timezone');
const async = require('async');

const serverAddress = config.serverAddress;

const us_all_periods = ical.parseFile('./resources/USAllPeriods.ics');
const ms_all_periods = ical.parseFile('./resources/MSAllPeriods.ics');


const uploadDayTypes = function (callback) {
    const req = unirest.post(serverAddress + "/schedule/get_token");

    req.headers({
        "content-type": "application/x-www-form-urlencoded",
    });

    req.form(config.credentials);

    req.end(function (res) {
        if (res.error) throw new Error(res.error);
        let token = res.body.token;
        async.eachSeries(us_all_periods, function (event, done) {
            let date = moment(event.start).tz('America/Denver').hours(6).minutes(0).seconds(0).milliseconds(0).utc();
            let req = unirest.post(serverAddress + '/schedule/period').type('json').send({
                'day': date.toISOString(), //standardized at 7:00 AM (MDT) the day of the period
                'start_time': event.start.toISOString(), //match db schema
                'end_time': event.end.toISOString(),
                'title': event.summary,
                'school': "US"
            });

            req.headers({
                'x-access-token': token
            });

            req.end(function (res) {
                if (res.error) {
                    done(res.error);
                } else {
                    done();
                }
            });
        }, function (err) {
            if(err) throw err;
            async.eachSeries(ms_all_periods, function (event, done) {
                let date = moment(event.start).tz('America/Denver').hours(6).minutes(0).seconds(0).milliseconds(0).utc();
                let req = unirest.post(serverAddress + '/schedule/period').type('json').send({
                    'day': date.toISOString(), //standardized at 7:00 AM (MDT) the day of the period
                    'start_time': event.start.toISOString(), //match db schema
                    'end_time': event.end.toISOString(),
                    'title': event.summary,
                    'school': "MS"
                });

                req.headers({
                    'x-access-token': token
                });

                req.end(function (res) {
                    if (res.error) {
                        done(res.error);
                    } else {
                        done();
                    }
                });
            }, function (err) {
                if(err) throw err;
                return callback();
            });
        });
    });
};

module.exports = uploadDayTypes;
