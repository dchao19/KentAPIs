const app = require('../app.js');
const port = require('../config').port; // set our port
const uploadDaytypes = require('./upload_daytypes.js');
const uploadPeriods = require('./upload_periods.js');
const createTravisDBAccount = require('./create_travis_account.js');

const server = app.listen(port, (err) => {
    if (err) throw new Error(err);
    console.log("App listening");
});
createTravisDBAccount(function(){
    uploadDaytypes(function(){
        uploadPeriods(function(){
            server.close();
            process.exit();
        });
    });
});
