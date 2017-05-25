const express = require('express');
const moment = require('moment');
const fs = require('fs');
const http = require('http');
const unirest = require('unirest');
const request = require('request');
const lunchUtils = require('../utils/lunchutil.js');
const Lunch = require('../models/Lunch');

const router = express.Router();

/*
 * Check for updates every hour
 */

function getNewMenus() {

}

/**
* @api {get} lunch/ Lunch API Status
* @apiName Lunch API Status
* @apiGroup Lunch
* @apiSuccess {String} message The Lunch API is in BETA. The functionality and structure of endpoints and routes WILL change.
* @apiSuccessExample Success-Response:
*   {
*		"message": "The Lunch API is in BETA. The functionality and structure of endpoints and routes WILL change."
*   }
*/
router.get('/', function(req, res){
	res.json({message: "The Lunch API is in BETA. The functionality and structure of endpoints and routes WILL change."});
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
	Lunch.findOne({date:date}, function(err, menu) {
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

/**
* @api {get} lunch/menu_image Get Lunch Menu
* @apiName Get Lunch Menu
* @apiGroup Lunch
* @apiDescription This endpoint, when loaded in a web browser, will return the image of the lunch menu of the date specified, or today if none is specified. If it is a weekend, it defaults to monday.
* @apiParam {String} date=now an ISO 8061 date string
* @apiSuccess {Image/Data} n/a Image data.
* @apiSuccessExample Success-Response:
*   "There is no example. It returns the lunch menu."
*/
router.get('/menu_image', function(req, res){
	let date = (req.query.date === 'now' || typeof req.query.date === 'undefined') ?
        moment() :
        moment(req.query.date); //moment date parsing tends to be more flexible, specifically with timezones
	
	fs.readFile('lunchdata/lunchdata.txt', 'UTF-8', (err, data) => {
		lunchUtils.getPictureName(date.day(), data, (result) => {
			let fileName = `${result}.jpg`;
			let url = `http://data2.finalsite.com/cf72/kentdenver/data/media/display/${fileName}`;

			lunchUtils.downloadImage(url, fileName)
			.then((path) => {
				res.sendFile(path);
			})
		});
	});
});


/**
* @api {get} lunch/force_update Force Lunch Data Update
* @apiName Force Lunch Data Update
* @apiGroup Lunch
* @apiDescription Although downloading the lunch data happens automagically everyday at 6:00 AM server time, this endpoint will force the download of the data.
* @apiSuccess {Boolean} success Success of download.
* @apiSuccess {String} message Additonal info.
* @apiSuccessExample Success-Response:
*   {
*		"success": true,
*		"message": "Update forced."
*	}
*/
router.get('/force_update', function(req, res){
	lunchUtils.forceUpdate()
	.then(() => {
		res.send({
			success: true,
			message: "Update forced."
		})
	})
	.catch((err) => {
		res.status(500).send({
			success: false,
			message: err
		});
	})
});

module.exports = router;