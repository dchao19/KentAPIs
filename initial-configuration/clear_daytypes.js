const mongoose = require('mongoose');
const moment = require('moment');
const timezone = require('moment-timezone');
const config = require('../config.js');


const Models = require('../models/ScheduleModels.js');
const Account = require('../models/Account.js');

const Period = Models.Period;
const DayType = Models.DayType;

mongoose.connect(config.database, function(err) {
        if (err) {
                console.log('Database connection error', err);
        } else {
                console.log('Database connection successful');
        }
});


let startDate = moment(new Date("2019-08-20 12:00:00.000Z"));

let endDate = moment(new Date("2020-05-25 12:00:00.000Z"));

let curDate = moment(startDate);

while(moment(curDate).isSameOrBefore(endDate)) {
        curDate.add(1, 'd');
        DayType.remove({date:curDate.toISOString()}, function(err, day) {
        });
}


