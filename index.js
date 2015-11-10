// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var moment = require('moment');
var ical = require('ical'), months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
today = moment("2015-11-9 9:02 AM","YYYY-MM-DD hh:mm A"); //global instance of right now in moment

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
var router2 = express.Router();

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req,res){
	res.json({message: "API OK"});
});

router2.get('/', function(req,res){
	res.json({message: "API v2 OK"});
});

router.get('/getScheduleDay', function(req, res) {
    var day;
 
    getScheduleDay(function(result){
    	day = result;
    	getCurrentPeriod(function(period, next){
    		respond(day, period, next);
    	});   
    });	

    function respond(scheduleDay, period, nextCool){
    	res.json({scheduleDay: scheduleDay, nowPeriod: period, nextPeriod: nextCool})
    };    
});

function getScheduleDay(callback){

	ical.fromURL('http://www.kentdenver.org/calendar/calendar_351.ics', {}, function(err, data) {
      for (var k in data){
        var ev = data[k];
        var dateTime = moment(ev.start);  
        if(dateTime.isSame(today, 'day')){
        	callback(ev.summary.substring(0,1).trim());
        }
      }
    });
}

function getCurrentPeriod(callback){
	var current = {};

	ical.fromURL('http://files.danielchao.me/kent/calendarWithPeriods.ics', {}, function(err, data) {
        var keys = Object.keys(data);
        for (var i = 0; i < keys.length; i++){
            var current;
            var next;
            var ev = data[keys[i]];
            var nextEv = data[keys[i+1]];
            if(nextEv === undefined) break;
            var startDateTime = moment(ev.start); 
            var endDateTime = moment(ev.end);

            var nextStart = moment(nextEv.start);
            var nextEnd = moment(nextEv.end);
        
            if(today.isBetween(startDateTime,endDateTime,'minute')) {
                current = {
                    period: ev.summary,
                    startTime: startDateTime.format("hh:mm a"),
                    endTime: endDateTime.format("hh:mm a")
                }

                if(moment(nextEv.start).isAfter(today.hours(15).minutes(10))){
                    next = {
                        period: "--",
                        startTime: "--",
                        endTime: "--"
                    }
                }else {
                    next = {
                        period: nextEv.summary,
                        startTime: moment(nextEv.start).format("hh:mm a"),
                        endTime: moment(nextEv.end).format("hh:mm a")
                    }
                }
                
                callback(current,next);
            }else if(today.isBetween(endDateTime, nextStart, 'minute')){
                current = {
                    period: "Passing",
                    startTime: endDateTime.format("hh:mm a"),
                    endTime: moment(nextEv.start).format("hh:mm a")
                }
                if(moment(nextEv.start).isAfter(today.hours(15).minutes(10))){
                    next = {
                        period: "--",
                        startTime: "--",
                        endTime: "--"
                    }
                }else {
                    next = {
                        period: nextEv.summary,
                        startTime: moment(nextEv.start).format("hh:mm a"),
                        endTime: moment(nextEv.end).format("hh:mm a")
                    }
                }

                callback(current, next);
            }
        }
    });	
}

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api OR /apiv2 (depending on which router is used)
app.use('/api', router);
app.use('/apiv2', router2);
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

