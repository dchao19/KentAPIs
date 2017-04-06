var unirest = require('unirest');
var config = process.env.NODE_ENV === 'testing' ? require('./travis_upload_config.js') : require('./config.js');
var serverAddress = config.serverAddress;
var Account = require('../models/Account');

var createPromoted = function(callback){
    var req = unirest.post(serverAddress + '/schedule/register');
    req.headers({
        'Content-Type': 'application/x-www-form-urlencoded'
    });
    req.form(config.credentials);
    req.end(function(res) {
        if (res.error) {
            callback();
        }
        Account.findOne({username: config.credentials.username}, function(err, account) {
            if(account){
                account.userType = 'Admin';
                account.save();
                callback();
            }
        });
    });
}

module.exports = createPromoted;