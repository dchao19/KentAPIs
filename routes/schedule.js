var express = require('express')
var router = express.Router();
var mongoose = require('mongoose')

var Models = require('../models/ScheduleModels.js')

var Period = Models.Period
var Day = Models.Day
var DayType = Models.DayType

router.get('/day_type', function(req, res, next) {
    res.json("Hi, there!");
});


router.get('/day_type/:date', function(req, res, next) {
    console.log(req.params);
    console.log(req.params.date);
    DayType.find({date:req.params.date}, function(err, queryResult) {
        if (err) res.status('400').send({
            error: "Invalid query"
        });
        res.json(queryResult);
    });
});

module.exports = router;
