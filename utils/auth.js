var jwt = require('jsonwebtoken');
var config = require('../config.js');
var secret = config.secret;

var nonStrictAuthentication = function(req,res,next){
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token) {
        jwt.verify(token, secret, function(err, decoded) {
            if(!err) {
				req.decoded = decoded;
            }
            next();
        });
    } else {
        next();
    }
};

var strictAuthentication = function(req,res,next){
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token) {
        jwt.verify(token, secret, function(err, decoded) {
            if(!err) {
				req.decoded = decoded;
				next();
            }else{
            	res.json(401, {"message": "An invalid token was provided"});
            }
        });
    } else {
        res.json(403, {"message": "No token was provided."});
    }
};

module.exports = {
	nonStrictAuthentication: nonStrictAuthentication,
	strictAuthentication: strictAuthentication
};
