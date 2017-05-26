const express = require('express');
const moment = require('moment');
const fs = require('fs');
const http = require('http');
const unirest = require('unirest');
const Lunch = require('../models/Lunch');
const config = require('../config');

const router = express.Router();

/*
 * Check for updates every hour
 */
function getNewMenus() {
    let request = unirest.get(`https://sheets.googleapis.com/v4/spreadsheets/1uAwV-1-LsriKcgwnpzMB9ZnR-2jOVlYwJT9HRaCZHpU/values/A1:D5?key=${config.google_api_key}`);
	request.end(function(response) {
		if(response.status === 200) {
			let data = response.body.values;
			let lastModified = moment(data[0][3]);
            let mondayModified;
            if(lastModified.day() === 5 || lastModified.day() === 6 || lastModified.day() === 0) {
                mondayModified = moment(lastModified).day(7).hours(6).minutes(0).seconds(0).milliseconds(0).utc();
            } else {
				mondayModified = moment(lastModified).day(1).hours(6).minutes(0).seconds(0).milliseconds(0).utc();
			}
            Lunch.findOne({sourceDate: lastModified}, function(err, existingLunch) {
            	if(err) throw err;
				if(!existingLunch) {
                    for (let i = 0; i < 5; i++) {
                        let curDate = moment(mondayModified).day(i + 1);
                        Lunch.findOne({date: curDate}, function (err, lunch) {
                            if (err) throw err;
                            if (lunch) {
                                console.log('Updating menus');
								lunch.menu = data[i][1];
								lunch.sourceDate = lastModified;
								lunch.save();
                            } else {
                                console.log('Creating new menus');
                                Lunch.create({
                                    date: curDate,
                                    menu: data[i][1],
                                    sourceDate: lastModified
                                }, function (err, newLunch) {
                                    if (err) throw err;
                                })
                            }
                        });
                    }
                }
            });


        }
	});
}
getNewMenus();
setInterval(getNewMenus, 20*60*1000);

/**
* @api {get} lunch/ Lunch API Status
* @apiName Lunch API Status
* @apiGroup Lunch
* @apiSuccess {String} message The Lunch API is in BETA. The functionality and structure of endpoints may change.
* @apiSuccessExample Success-Response:
*   {
*		"message": "The Lunch API is in BETA. The functionality and structure of endpoints may change."
*   }
*/
router.get('/', function(req, res){
	res.json({message: "The Lunch API is in BETA. The functionality and structure of endpoints may change."});
});

/**
 * @api {get} lunch/menu Get Lunch Menu
 * @apiName Get Lunch Menu
 * @apiGroup Lunch
 * @apiDescription This endpoint returns the lunch menu for a given day (only works up to the end of the current week). It defaults to the current day.
 * @apiParam {String} date=now an ISO 8061 date string
 * @apiSuccess {String} date Date in ISO8061 Format, UTC time
 * @apiSuccess {String} menu A menu for the given day.
 * @apiSuccessExample Success-Response:
 *   {
 *
 *   }
 */

router.get('/menu', function(req, res) {
    let date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
        moment().hours(6).minutes(0).seconds(0).milliseconds(0).utc() :
        moment(req.query.date).hours(6).minutes(0).seconds(0).milliseconds(0).utc();
	Lunch.findOne({date:date}, '-_id -__v -sourceDate', function(err, menu) {
        if(err) {
            return res.status(500).send({
                success: false,
                error: "Internal server error"
            });
        }
        if (menu) {
            return res.send(menu);
        }
        return res.send({});
	});
});


module.exports = router;