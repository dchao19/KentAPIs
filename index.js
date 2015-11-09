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
today = moment();

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req,res){
	res.json({message: "API OK"});
});

router.get('/getScheduleDay', function(req, res) {
    var returnDay1 = {};
    ical.fromURL('http://www.kentdenver.org/calendar/calendar_351.ics', {}, function(err, data) {
      for (var k in data){
        var ev = data[k];
        var dateTime = moment(ev.start);  
        if(dateTime.isSame(new Date(), 'day')){
        	var scheduleDayLetter = ev.summary.substring(0,1)
          	returnDay1 = {
          		scheduleDay: scheduleDayLetter,
          		dateTime: moment(ev.start)
          	}
          	res.json(returnDay1); 	
        }
      }
    });	    
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

