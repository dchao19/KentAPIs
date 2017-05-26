// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var moment = require('moment');
var config = require('./config.js');

//Set-up database
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
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
app.set('view engine', 'pug');
app.use('/static', express.static('static'));

// ROUTES FOR OUR API
// =============================================================================
var router = require('./routes/schedule.js'); // get an instance of the express Router
var lunch = require('./routes/lunch.js');
var admin = require('./routes/admin.js');

// REGISTER OUR ROUTES -------------------------------
app.use('/schedule', router);
app.use('/lunch', lunch);
app.use('/admin', admin);


module.exports = app;
