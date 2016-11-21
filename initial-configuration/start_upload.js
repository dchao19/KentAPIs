var app = require('../app.js');
var port = process.env.PORT || 8080; // set our port
var uploadDaytypes = require('./upload_daytypes.js');
var uploadPeriods = require('./upload_periods.js');
var createTravisDBAccount = require('./create_travis_account.js');

var server = app.listen(port);
createTravisDBAccount(function(){
    uploadDaytypes(function(){
        uploadPeriods(function(){
            server.close();
            process.exit();
        });
    });
});
