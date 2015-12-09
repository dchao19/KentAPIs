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
    var date = req.params.date;
    if(date == "now") date = moment();
    DayType.find({date:date}, function(err, queryResult) {
        if (err) res.status('400').send({
            error: "Invalid query"
        });
        res.json(queryResult);
    });
});


router.post('/period', function(req,res){
	Period.create({
		day: new Date(), 
		start_time: new Date(),
		end_time: new Date(), 
		title: req.body.title,
		linked_day: 1
	},function(err, post){
		if(err) res.json("error");
		res.json(post);
	});
});
module.exports = router;
