var express = require('express');
var moment = require('moment');
var fs = require('fs');
var http = require('http');
var unirest = require('unirest');
var request = require('request');
var lunchUtils = require('../utils/lunchutil.js');

var router = express.Router();

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
			let fileName = `${result}.jpg`
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