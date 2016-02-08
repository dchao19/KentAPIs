var ical = require('ical');
var unirest = require('unirest');
var moment = require('moment');
var config = require('./config.js');
var timezone = require('moment-timezone');

var serverAddress = config.serverAddress;

var all_periods = ical.parseFile('./resources/AllPeriods.ics');

var req = unirest.post(serverAddress + "/schedule/get-token");

req.headers({
        "content-type": "application/x-www-form-urlencoded",
});

req.form(config.credentials);

req.end(function (res) {
        if (res.error) throw new Error(res.error);
        var token = res.body.token;

        for( var i in all_periods) {
                if(all_periods.hasOwnProperty(i)) {
                        var event = all_periods[i];

                        var date = moment(event.start).tz('America/Denver').hours(6).minutes(0).seconds(0).milliseconds(0).utc();
                        var req = unirest.post(serverAddress + '/schedule/period').type('json').send({
                                'day' : date.toISOString(), //standardized at 7:00 AM (MDT) the day of the period
                                'start_time': event.start.toISOString(), //match db schema
                                'end_time': event.end.toISOString(),
                                'title': event.summary,
                        });

                        req.headers({
                            'x-access-token': token
                        });

                        req.end(function(res) {
                            if(res.error) {
                                    console.log(res.error);
                            }
                        });
        }
    }
});




