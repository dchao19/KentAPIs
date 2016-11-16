var ical = require('ical')
var unirest = require('unirest')
var moment = require('moment');
var timezone = require('moment-timezone')
var config = process.env.NODE_ENV === 'testing' ? require('./travis_upload_config.js') : require('./config.js');
var async = require('async');

var serverAddress = config.serverAddress;

var day_types = ical.parseFile('./resources/AllDayTypes.ics');

var uploadDayTypes = function(callback){
        var req = unirest.post(serverAddress + "/schedule/get-token");

        req.headers({
                "content-type": "application/x-www-form-urlencoded",
        });

        req.form(config.credentials);

        req.end(function (res) {
                if (res.error) throw new Error(res.error);
                var token = res.body.token;
                async.each(day_types, function(day, done) {
                        var date = moment(day.start).tz('America/Denver').hours(6).minutes(0).add(1, 'd').utc();
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