var expect = require('chai').expect,
    unirest = require('unirest'),
    boot = require('../index').boot,
    shutdown = require('../index').shutdown,
    moment = require('moment'),
    timezone = require('moment-timezone'),
    port = 8080;

//describe('Start server', function() {
//    before(function() {
//        boot();
//    });
//});
//
//describe('Api status', function() {
//    it('should respond to get', function() {
//        unirest.get('http://localhost:' + port + '/schedule').end(function(res) {
//            expect(res.status).to.equal(200);
//        });
//    });
//    it('should say API OK', function() {
//        unirest.get('http://localhost:' + port + '/schedule').end(function(res) {
//            expect(res.body).to.equal("API OK");
//        });
//    });
//});
//
//describe('Periods agree with letter days', function() {
//    var date = moment('2015-08-27');
//    unirest.get('http://localhost:' + port + '/schedule/day_type?date=' + date).end(function(res) {
//        if(res.body.date) {
//            unirest.get('ht
//        }
//    });
//});
//
//describe('Stop server', function() {
//    after(function() {
//        shutdown();
//    }); 
//});
//
function testDay(date) {
        console.log('Here');
    unirest.get('http://localhost:' + port + '/schedule/day_type?date=' + date.format("YYYY-MM-DD")).end(function(res) {
        console.log(res.body);
        if(res.body.date) {
            unirest.get('http://localhost:' + port + '/schedule/all_periods?date=' + date.format("YYYY-MM-DD")).end(function(res2) {
                console.log(res2.body);
                console.log("Hello");
        });
        }
    }); 
}

module.exports = testDay
