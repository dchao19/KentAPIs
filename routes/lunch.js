var express = require('express');
var moment = require('moment');
var http = require('http');
var unirest = require('unirest');
var request = require('request');
var lunchUtils = require('../utils/lunchutil.js');

var router = express.Router();

var lunchPageContent = "";

router.get('/', function(req, res){
	res.json({"message": "The Lunch API is in BETA. The functionality and structure of endpoints and routes WILL change."});
});


router.get('/menu_image', function(req, res){
	lunchUtils.getPictureName(moment().day() , lunchPageContent, function(result){
		res.json({
			lunchFileName: result + ".png"
		});
	});
});

//TODO: return a cleaner text with commas, etc. 
router.get('/menu_text', function(req, res){

});

//TODO: Automate this endpoint using node-scheduler so it runs every morning/weekday
router.get('/download_data', function(req, res){
	unirest.get('http://www.kentdenver.org/cf_media/embed.cfm?mediaChanID=0&mediaCatID=0&mediaGroupID=85&h=450', function(response){
		lunchPageContent = response.body;
		res.json({"message": "data downloaded."});
	});
});

module.exports = router;