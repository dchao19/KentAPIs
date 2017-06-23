const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
    day: Date,
    start_time: Date,
    end_time: Date,
    title: String,
    linked_day: String,
    school: String
});

const dayTypeSchema = new mongoose.Schema({
    date: Date,
    type: String
});

const Period = mongoose.model('Period', periodSchema);
const DayType = mongoose.model('DayType', dayTypeSchema);


module.exports = {
        Period: Period,
        DayType: DayType
};
