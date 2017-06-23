const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const Account = new Schema({
    username: String,
    password: String,
    userType: String,
    classNames: Schema.Types.Mixed
});

Account.plugin(passportLocalMongoose);
module.exports = mongoose.model('Account', Account);
