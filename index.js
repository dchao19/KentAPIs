var app = require('./app.js');
var config = require('./config.js');
// START THE SERVER
// =============================================================================
app.listen(config.port);
console.log('Magic happens on port ' + port);
