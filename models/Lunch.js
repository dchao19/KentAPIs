/**
 * Created by aclement on 5/24/17.
 */
const mongoose = require('mongoose');

const LunchSchema = mongoose.Schema({
    date: Date,
    menu: String,
    sourceDate: Date
});


module.exports = mongoose.model("Lunch", LunchSchema);