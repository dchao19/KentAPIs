var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
    userType: String,
    classNames: Schema.Types.Mixed
});

Account.plugin(passportLocalMongoose);
module.exports = mongoose.model('Account', Account);
