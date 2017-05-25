const schedule = require('node-schedule');
const unirest = require('unirest');
const fs = require('fs');
let utils = {
    schedule: (cronString, job) => {
        schedule.scheduleJob('Scheduled Lunch Update', cronString, job)
    },

    download: () => {
        return new Promise((resolve, reject) => {
            let request = unirest.get('http://www.kentdenver.org/cf_media/embed.cfm?mediaChanID=0&mediaCatID=0&mediaGroupID=85&h=450');
            request.end((response) => {
                if (response.error) {
                    return reject(response.error);
                }
                resolve(response.body);
            });
        });
    },

    cache: (data, fileName) => {
        return new Promise((resolve, reject) => {
            fs.writeFile(fileName, data, 'UTF-8', (err) => {
                if (err) return reject(err);
                resolve();
            })
        });
    },
};

module.exports = utils;