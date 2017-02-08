var express = require('express')
var router = express.Router();
var mongoose = require('mongoose')
var jwt = require('jsonwebtoken')
var moment = require('moment')
var timezone = require('moment-timezone')
var async = require('async');

var Models = require('../models/ScheduleModels.js')
var Account = require('../models/Account.js');

var Period = Models.Period
var Day = Models.Day
var DayType = Models.DayType

var config = require('../config.js');
var secret = config.secret;

var passport = require('passport')
var LocalStrategy = require('passport-local')

var authUtils = require('../utils/auth.js');

router.use(passport.initialize())

passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

router.use(authUrls.strictAuthentication);

// TODO specify templates

router.get('/admin', function(req, res){
  // TODO return render admin-panel
});

router.get('/admin/days', function(req, res){
  let date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
      moment() :
      moment(req.query.date);

  let num_days = (typeof req.query.num_days === 'undefined') ? 12 : parseInt(num_days);

  if(!date.isValid()){
    return res.json(400, {
      success: false,
      error: "Unable to parse date provided in request"
    });
  }

  DayType.find({ date:{$gte: date} }).
  select({date: 1, type: 1})
  limit(num_days).
  sort({date: 1}).
  exec(function(err, days){
    if(err){
      return res.json(500, {
        success: false,
        error: "An error occurred. Good luck."
      })
    }else{
      // TODO return render days
      return res.render('days', days);
      // days: [{date, type}]
    }
  })

});

router.get('/admin/day', function(req, res){
  let date = (req.query.date == 'now' || typeof req.query.date == 'undefined') ?
  moment().hours(6).minutes(0).seconds(0).milliseconds(0).utc() :
  moment(req.query.date).hours(6).minutes(0).seconds(0).milliseconds(0).utc();

  if(!date.isValid()) {
      res.json(400, {
          success: false,
          error: "Unable to parse date provided in request"
      });
  }

  Period.find({day: date.toISOString()}).
  select({start_time:1, end_time:1, title:1}).
  sort({day:1}).
  exec(function(err, periods){
    if(err) return res.json(500, "Lol. Good Smert.");
    // TODO return render periods
    return res.render('periods', periods);
    // periods: [period]
  });
});

router.get('/admin/period', function(req, res){
  let date = (req.query.date == 'now' || typeof req.query.date == 'undefined') ?
    moment() :
    moment(req.query.date);
  if(!date.isValid()) {
      res.json(400, {
          success: false,
          error: "Unable to parse date provided in request"
      });
  }
  Period.findOne(
      {
          $and: [
              {start_time: {$lte: date.toISOString()}}, //Now "is a period" if the time is in between the start/end time of a period
              {end_time: {$gte: date.toISOString()}}
          ]
      },
      '-linked_day -_id -__v',
      function(err, period) {
          if(err) return res.json(500, {
            success: false,
            error: "Oops. I'm sorry. Alex is sorry."
          });
          // TODO return render period
          return res.render('period', period);
          // period: {day, start_time, end_time, title};
      });

});

router.post('/admin/update_period', function(req, res){
  // Change period number, start/end time
  // Or, if no date if found, creates a new one
  let date = (typeof req.body.date === 'undefined') ? false : req.body.date;
  if(!date) return res.json(400, {success:false, error:"No date provided"});
  let m_date = moment(date);
  if(!m_date.isValid()) return res.json(400, {success:false, error:"Invalid date provided"});

  let start_time = req.body.start_time;
  let end_time = req.body.end_time;
  let period_name = req.body.period_name;
  if(typeof start_time == 'undefined' || typeof end_time == 'undefined' || typeof period_name == 'undefined'){
    return res.json(400, {success:false, error:"Missing period information"});
  }
  let m_start_time = moment(start_time);
  let m_end_time = moment(end_time);
  if(!(m_start_time.isValid() || m_end_time.isValid())){
    return res.json(400, {success:false, error:"Invalid times provided."});
  }

  Period.findOneAndUpdate(
    {day: m_date},
    {$set: {start_time: start_time}, $set: {end_time: endtime}, $set: {title: period_name}},
    {upsert: true},
    function(err, period){
      if(err) return res.json(500, {success:false, error:"I am not good with computer"});
      else return res.json(200, {success:true, msg:"Updated period!"});
    });
});

router.post('/admin/delete_period', function(req, res){
  // Delete a period
  let date = (typeof req.body.date === 'undefined') ? false : req.body.date;
  if(!date) return res.json(400, {success:false, error:"No date provided"});
  let m_date = moment(date);
  if(!m_date.isValid()) return res.json(400, {success:false, error:"Invalid date provided"});
  Period.findOneAndRemove({day: m_date}, function(err){
    if(err) return res.json(500, {success:false, error:"Could not remove day"});
    else return res.json(200, {success:true, msg: "Removed period!"});
  })
});


router.post('/admin/delete_day', function(req, res){
  // delete a day

  // should delete associated periods? TODO

  let date = (typeof req.body.date === 'undefined') ? false : req.body.date;
  if(!date) return res.json(400, {success:false, error:"No date provided"});
  let m_date = moment(date);
  if(!m_date.isValid()) return res.json(400, {success:false, error:"Invalid date provided"});
  m_date = m_date.hours(6).minutes(0).seconds(0).milliseconds(0).utc();

  DayType.findOneAndRemove({date: m_date}, function(err){
    if(err) return res.json(500, {success:false, error:"Could not remove day"});
    else{
      Period.remove({day: m_date}, function(err){
        if(err) return res.json(500, {success:false, error:"Could not remove associated periods"});
        else return res.json(200, {success:true, msg: "Crushed it!"});
      })
    }
  })
});

router.post('/admin/update_day', function(req, res){
  // update a day's day type
  // or, if the day is not found, make it
  let date = (typeof req.body.date === 'undefined') ? false : req.body.date;
  if(!date) return res.json(400, {success:false, error:"No date provided"});
  let m_date = moment(date);
  if(!m_date.isValid()) return res.json(400, {success:false, error:"Invalid date provided"});
  m_date = m_date.hours(6).minutes(0).seconds(0).milliseconds(0).utc();

  let type = (typeof req.body.day_type === 'undefined') ? false : req.body.type;
  if(!type) return res.json(400, {sucess:false, error:"No day type provided"});

  DayType.findOneAndUpdate(
    {date: m_date},
    {$set: {date: m_date}, $set: {type: type}},
    {upsert: true},
    function(err, period){
      if(err) return res.json(500, {success:false, error:"I am not good with computer 2"});
      else return res.json(200, {success:true, msg:"Updated period!"});
    });
});

// router.post('/admin/move_day', function(req, res){
//   // move's a day and all associated periods
// })
