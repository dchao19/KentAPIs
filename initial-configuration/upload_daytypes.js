var ical = require('ical')
var unirest = require('unirest')
var moment = require('moment');
var config = require('./config')

var serverAddress = config.serverAddress;

var day_types = ical.parseFile('./resources/AllDayTypes.ics');

var req = unirest.post(serverAddress + "/schedule/get-token");

req.headers({
        "content-type": "application/x-www-form-urlencoded",
});

req.form(config.credentials);

req.end(function (res) {
        if (res.error) throw new Error(res.error);
        var token = res.body.token;

        for(var i in day_types){
                if(day_types.hasOwnProperty(i)){
                        var day = day_types[i];
                        var date = moment(day.start).hours(6).minutes(0).utc();
                        req = unirest.post(serverAddress + '/schedule/day_type').type('json').send({
                                'date': date.toISOString(),
                                'type': day.summary.substring(0,1)
                }).headers({
                    'x-access-token': token
                }).end(function(res){
                    if(res.error)console.log("Error: " + res.error);
                    console.log(res.body);
                });

                }               
        }

});
