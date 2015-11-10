// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var moment = require('moment');
var ical = require('ical'), months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
today = moment("2015-11-9 1:25 PM","YYYY-MM-DD hh:mm A"); //global instance of right now in moment
var router2 = express.Router();
scheduleDayLetter = ""; // I'm polluting the global scope but I don't even care!
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req,res){
	res.json({message: "API OK"});
});

router2.get('/', function(req,res){
	res.json({message: "API v2 OK"});
});

router.get('/getScheduleDay', function(req, res) {
    var day;
    var period;
    
    getScheduleDay(function(result){
    	day = result;
    	getCurrentPeriod(function(result){
    		period = result;
    		respond(day, period);
    	});   
    });	

    function respond(scheduleDay, period){
    	res.json({scheduleDay: scheduleDay, nowPeriod: period})
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
    	for (var k in data){
        	var ev = data[k];        
        	var startDateTime = moment(ev.start); 
        	var endDateTime = moment(ev.end);
        
        	if(today.isBetween(startDateTime,endDateTime,'minute')) {
        		current = {
        			period: ev.summary,
        			startTime: startDateTime.format("hh:mm a"),
        			endTime: endDateTime.format("hh:mm a")
        		}
        		callback(current);
 			}     
		}
	});	
}

	
// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
app.use('/apiv2', router2);
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

