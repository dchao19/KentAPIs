var ical = require('ical')
var unirest = require('unirest')
var moment = require('moment');

var all_periods = ical.parseFile('./resources/AllPeriods.ics');

for( var i in all_periods) {
        if(all_periods.hasOwnProperty(i)) {
            var event = all_periods[i];

            var date = moment(event.start).hours(6).minutes(0).seconds(0).milliseconds(0).utc();
            var req = unirest.post('http://localhost:8080/schedule/period').type('json').send({
                'day' : date.toISOString(), //standardized at 7:00 AM (MDT) the day of the period
                'start_time': event.start.toISOString(), //match db schema
                'end_time': event.end.toISOString(),
                'title': event.summary,
            });
             
            req.end(function(res) {
                if(res.error) console.log(res.error);
                console.log(res.body);
            });
        }
}




