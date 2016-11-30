// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
moment = require('moment');
today = moment("2015-11-9 9:02 AM", "YYYY-MM-DD hh:mm A"); //global instance of right now in moment
var config = require('./config.js');

//Set-up database
var mongoose = require('mongoose');
mongoose.connect(config.database, function(err) {
    if (err) {
        console.log('Database connection error', err);
    } else {
        console.log('Database connection successful');
    }
});

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


// ROUTES FOR OUR API
// =============================================================================
var router = require('./routes/schedule.js'); // get an instance of the express Router
var lunch = require('./routes/lunch.js');

var router2 = express.Router();

router2.get('/', function(req, res) {
    res.json({
        message: "API v2 OK"
    });
});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api OR /apiv2 (depending on which router is used)
app.use('/schedule', router);
app.use('/lunch', lunch);
app.use('/apiv2', router2);

module.exports = app;