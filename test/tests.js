const expect = require('chai').expect,
    unirest = require('unirest'),
    boot = require('../index').boot,
    shutdown = require('../index').shutdown,
    moment = require('moment'),
    timezone = require('moment-timezone'),
    port = 8080;

let startDate = moment('2016-08-24');
const endDate = moment('2017-05-25');
let dates = [];
while (startDate.isBefore(endDate)) {
    dates.push(moment(startDate));
    startDate.add(1, 'day');
}

describe('Start server', function () {
    before(function () {
        boot();
    });
});


describe('Api status', function () {
    it('should respond to get', function () {
        unirest.get('http://localhost:' + port + '/schedule').end(function (res) {
            expect(res.status).to.equal(200);
        });
    });
    it('should say API OK', function () {
        unirest.get('http://localhost:' + port + '/schedule').end(function (res) {
            expect(res.body.message).to.equal("API OK");
        });
    });
});


describe('Periods agree with letter days', function () {
    let count = 0;
    it('checks all dates', function (done) {
        this.timeout(5000);
        dates.forEach(function (date) {
            getDay(date, function (currentDay) {
                count++;
                if (currentDay !== "No school") {
                    if (currentDay.length === 0) {
                        console.log(date);
                    }
                    expect(currentDay).to.not.be.undefined;
                    expect(currentDay.length).to.be.above(5);
                }
                if (count === dates.length) {
                    done();
                }
            });
        });
    });
});

describe('Next occurrence', function () {
    it('Finds a period', function () {
        getNext("period", "Period 1", dates[0], 1, function (result) {
            expect(result.length).to.equal(1);
            expect(result.title).to.equal("Period 1");
        });
    });
    it('Finds a day', function () {
        getNext("day_type", "C", dates[0], 1, function (result) {
            expect(result.length).to.equal(1);
            expect(result.title).to.equal("C");
        });
    });
    it('Finds 5 periods', function () {
        getNext("period", "Period 1", dates[0], 1, function (result) {
            expect(result.length).to.equal(5);
        });
    });
    it('Finds 5 days', function () {
        getNext("day_type", "C", dates[0], 1, function (result) {
            expect(result.length).to.equal(5);
        });
    });

});

describe('Stop server', function () {
    after(function () {
        shutdown();
    });
});

function getNext(type, identifier, date, maxResults, cb) {
    unirest.get(`http://localhost:${port}/schedule/us/next_occurrence?date=${date.format("YYYY-MM-DD")}&maxResults=${maxResults}&identifier=${identifier}&type=${type}`)
        .end(function (res) {
            cb(res.body);
        });
}

function getDay(date, cb) {
    unirest.get(`http://localhost:${port}/schedule/day_type?date=${date.format("YYYY-MM-DD")}`).end(function (res) {
        if (res.body.type !== 'X') {
            unirest.get(`http://localhost:${port}/schedule/us/all_periods?date=${date.format("YYYY-MM-DD")}`).end(function (res2) {
                cb(res2.body);
            });
        } else {
            cb("No school");
        }
    });
}

