var mongoose = require('mongoose')
var moment = require('moment')
var timezone = require('moment-timezone')
var config = require('../config.js')


var Models = require('../models/ScheduleModels.js')
var Account = require('../models/Account.js');

var Period = Models.Period
var Day = Models.Day
var DayType = Models.DayType

mongoose.connect(config.database, function(err) {
        if (err) {
                console.log('Database connection error', err);
        } else {
                console.log('Database connection successful');
        }
});


var startDate = moment(new Date("2016-08-23 12:00:00.000Z"));

var endDate = moment(new Date("2017-05-25 12:00:00.000Z"));

var curDate = moment(startDate);

while(moment(curDate).isSameOrBefore(endDate)) {
        curDate.add(1, 'd');
        DayType.remove({date:curDate.toISOString()}, function(err, day) {
                console.log(day);
        });
}


