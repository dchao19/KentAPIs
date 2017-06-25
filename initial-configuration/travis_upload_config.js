const config = {};

config.serverAddress = `http://localhost:${require('../config').port}`;

config.credentials = {
    "username": "travis",
    "password": "travis"
};

module.exports = config;