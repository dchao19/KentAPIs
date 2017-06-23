// BASE SETUP
// =============================================================================

// call the packages we need
const express = require('express'); // call express
const app = express(); // define our app using express
const bodyParser = require('body-parser');
const moment = require('moment');
const config = require('./config.js');

//Set-up database
const mongoose = require('mongoose');
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
app.locals.moment = moment;

// ROUTES FOR OUR API
// =============================================================================
const router = require('./routes/schedule.js'); // get an instance of the express Router
const lunch = require('./routes/lunch.js');
const admin = require('./routes/admin.js')(mongoose.connection);

// REGISTER OUR ROUTES -------------------------------
app.use('/schedule', router);
app.use('/lunch', lunch);
app.use('/admin', admin);


module.exports = app;
