var ical = require('ical')
var unirest = require('unirest')
var moment = require('moment');

var day_types = ical.parseFile('./resources/AllDayTypes.ics');

for(var i in day_types){
    if(day_types.hasOwnProperty(i)){
        var day = day_types[i];
        var date = moment(day.start);
        date.hours(7).minutes(0);
        var req = unirest.post('http://localhost:8080/schedule/day_type').type('json').send({
            'date': date.toISOString(),
            'type': day.summary.substring(0,1)
        }).end(function(res){
            if(res.error)console.log("Error: " + res.error);
            console.log(res.body);
        })

    }
}