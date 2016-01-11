var mongoose = require('mongoose');

var periodSchema = new mongoose.Schema({
    day: Date,
    start_time: Date,
    end_time: Date,
    title: String,
    linked_day: String
});

var daySchema = new mongoose.Schema({
    date: Date,
    period_list_pretty: Array,
    period_list_ids: Array,
    title: String,
    linked_day_type: String
});

var dayTypeSchema = new mongoose.Schema({
    date: Date,
    type: String
});

var Period = mongoose.model('Period', periodSchema);
var Day = mongoose.model('Day', daySchema);
var DayType = mongoose.model('DayType', dayTypeSchema);


module.exports = {
        Period: Period,
        Day: Day,
        DayType: DayType
};
