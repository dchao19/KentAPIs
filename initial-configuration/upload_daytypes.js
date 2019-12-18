const ical = require('ical');
const unirest = require('unirest');
const moment = require('moment');
const timezone = require('moment-timezone');
const config =  require('./config.js');
const async = require('async');

const serverAddress = config.serverAddress;

const day_types = ical.parseFile('./resources/AllDayTypes.ics');

console.log(config);

const uploadDayTypes = function(callback){
        let req = unirest.post(serverAddress + "/schedule/get_token");

        req.headers({
                "content-type": "application/x-www-form-urlencoded",
        });
        req.form(config.credentials);

        req.end(function (res) {
                if (res.error) throw new Error(res.error);
                let token = res.body.token;
                async.each(day_types, function(day, done) {
                        let date = moment(day.start).tz('America/Denver').hours(6).minutes(0).utc();
                        req = unirest.post(serverAddress + '/schedule/day_type').type('json').send({
                                'date': date.toISOString(),
                                'type': day.summary.substring(0,1)
                        }).headers({
                                'x-access-token': token
                        }).end(function(res){
                                if(res.error) {
                                        done(res.error);
                                }
                                done();
                        });
                }, function() {
                        callback();
                });
        });
};

module.exports = uploadDayTypes;
