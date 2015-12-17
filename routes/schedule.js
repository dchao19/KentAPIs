var express = require('express')
var router = express.Router();
var mongoose = require('mongoose')

var Models = require('../models/ScheduleModels.js')

var Period = Models.Period
var Day = Models.Day
var DayType = Models.DayType

router.get('/day_type', function(req, res, next) {
    var today = moment().hours(6).minutes(0).seconds(0).milliseconds(0).utc();
    DayType.findOne({date: today.toDate()}, function(error,results){
        res.json(results);
    });
});


router.get('/day_type', function(req, res, next) {
    var date = req.query.date;
    if(date == "now") date = moment();
    DayType.find({date:date}, function(err, queryResult) {
        if (err) res.status('400').send({
            error: "Invalid query"
        });
        res.json(queryResult);
    });
});

router.get('/period', function(req, res) {
    Period.find({day:req.query.date}, function(error, result) {
        if(error) res.status('400').send({
                error: "Invalid query"
        });
        res.json(result);
    });

});


router.post('/period', function(req,res){
    DayType.findOne({date:new Date(req.body.day)}, function(error, result){
        var poster = {
            day: new Date(req.body.day),
            start_time: new Date(req.body.start_time),
            end_time: new Date(req.body.end_time),
            title: req.body.title,
            linked_day: result._id
        };
        Period.create(poster, function(err, post){
            if(err) res.json("error");
            res.json(post);
        });   
    })
});

router.post('/day_type', function(req,res){
    var date = moment(req.body.date).hours(6).utcOffset(-6).format();
    DayType.create({
        'date': date,
        'type': req.body.type
    },
    function(err,post){
        if(err) res.json("error");
        res.json(post);
    });
});

module.exports = router;
