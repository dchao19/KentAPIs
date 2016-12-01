var express = require('express');
var moment = require('moment');
var fs = require('fs');
var http = require('http');
var unirest = require('unirest');
var request = require('request');
var lunchUtils = require('../utils/lunchutil.js');

var router = express.Router();

router.get('/', function(req, res){
	res.json({message: "The Lunch API is in BETA. The functionality and structure of endpoints and routes WILL change."});
});


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


//TODO: Automate this endpoint using node-scheduler so it runs every morning/weekday
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