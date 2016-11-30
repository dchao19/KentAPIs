var expect = require('chai').expect,
    unirest = require('unirest'),
    boot = require('../index').boot,
    shutdown = require('../index').shutdown,
    moment = require('moment'),
    timezone = require('moment-timezone'),
    port = 8080;

describe('Start server', function() {
        before(function() {
                boot();
        });
});

describe('Api status', function() {
        it('should respond to get', function() {
                unirest.get('http://localhost:' + port + '/schedule').end(function(res) {
                        expect(res.status).to.equal(200);
                });
        });
        it('should say API OK', function() {
                unirest.get('http://localhost:' + port + '/schedule').end(function(res) {
                        expect(res.body.message).to.equal("API OK");
                });
        });
});

describe('Periods agree with letter days', function() {
        var startDate = moment('2015-08-27');
        var endDate = moment('2015-11-30');
        var dates = [];
        while(startDate.isBefore(endDate)) {
                dates.push(moment(startDate));
                startDate.add(1, 'day');
        }
        var count = 0;
        it('checks all dates', function(done) {
                dates.forEach(function(date, index) {
                        getDay(date, function(currentDay) {
                                count++;
                                if(currentDay != "No school") {
                                        expect(currentDay).to.not.be.undefined;
                                        expect(currentDay.length).to.be.above(5);
                                }
                                if(count == dates.length) {
                                        done();  
                                }
                        });
                });
        });
});

describe('Stop server', function() {
        after(function() {
                shutdown();
        }); 
});

function getDay(date, cb) {
        unirest.get('http://localhost:' + port + '/schedule/day_type?date=' + date.format("YYYY-MM-DD")).end(function(res) {
                if(res.body.type !== 'X') {
                        var dayType = res.body.type;
                        unirest.get('http://localhost:' + port + '/schedule/all_periods?date=' + date.format("YYYY-MM-DD")).end(function(res2) {
                                cb(res2.body);
                        });
                } else {
                        cb("No school");
                }
}); 
}

