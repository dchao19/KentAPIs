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

// REGISTER OUR ROUTES -------------------------------
app.use('/schedule', router);
app.use('/lunch', lunch);

//Schedule the download of lunch data
var scheduleUtils = require('./utils/scheduleLunchDownload.js');
scheduleUtils.schedule('0 0 6 * * *', () => {
    scheduleUtils.download()
    .then((data) => {
        scheduleUtils.cache(data, `lunchdata/lunchdata.txt`)
        .catch((error) => {
            console.error('Error saving the lunch data to file.');
        })
    })
    .catch((error) => {
        console.error('Error downloading lunch data.');
    })
});

//create folders for lunch data

var lunchUtils = require('./utils/lunchutil.js');
lunchUtils.createFolders([
    'lunchdata',
    'lunchdata/menus'
]);

module.exports = app;