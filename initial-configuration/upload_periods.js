var ical = require('ical')
var unirest = require('unirest')


var all_periods = ical.parseFile('./resources/AllPeriods.ics')

for( var i in all_periods) {
        if(all_periods.hasOwnProperty(i)) {
                var event = all_periods[i];
                console.log(event.start);
                //var req = unirest.post('localhost:8080');
                var req = unirest.post('http://mockbin.org/bin/f53d2e08-9ab9-41e4-9de3-a8ad97df3aa4');
                req.multipart([{
                                'content-type': 'application-json',
                                'body': JSON.stringify({'__type': 'Date', 
                                        'iso': event.start.toISOString()
                                })
                }]);
                req.end(function(res) {
                    if(res.error) console.log(res.error);
                    console.log(res.body);
                });
                break;
        }
}



