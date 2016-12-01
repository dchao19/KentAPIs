const scheduleUtils = require('./scheduleLunchDownload.js');
const unirest = require('unirest');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const async = require('async');

var getPictureName = function(numericalDOW, lunchSource, callback){
	if(numericalDOW === 0 || numericalDOW === 6) numericalDOW = 1;
	
	for(var i = 1; i <= numericalDOW; i++){
		lunchSource = lunchSource.substring(lunchSource.indexOf("data-objid=") + 12);
		if(i == numericalDOW) {
			callback(lunchSource.substring(0, lunchSource.indexOf(">") - 1));
		}
		else lunchSource.replace("data-objid=", "notneeded=");
	}
}

var forceUpdate = () => {
	return new Promise((resolve, reject) => {
		scheduleUtils.download()
		.then((data) => {
			scheduleUtils.cache(data, 'lunchdata/lunchdata.txt')
			.then(() => {
				resolve();
			})
			.catch((err) => {
				reject(err);
			});
		})
		.catch((err) => {
			reject(err);
		})
	});
}

var downloadImage = (url, fileName) => {
	return new Promise((resolve, reject) => {
		let request = unirest.get(url);
		request.options.encoding = 'binary';
		request.end((res) => {
			if (res.error) return reject();
			fs.open(`lunchdata/menus/${fileName}`, 'wx', (err, fd) => {
				if (err) {
					if (err.code === 'EEXIST') {
						resolve(`${path.resolve('lunchdata', 'menus', fileName)}`);
					} else {
						reject(err);
					}
				} else {
					fs.write(fd, res.body, 0, 'binary', (err, bytesWritten, str) => {
						resolve(`${path.resolve('lunchdata', 'menus', fileName)}`)
					});	
				}			
			});
		})
	});
}

var createFolders = (folders) => {
	return new Promise((resolve, reject) => {
		async.each(folders, (folder, callback) => {
			mkdirp(path.join(folder), (err) => {
				if (err) callback(err);
				else callback();
			});
		}, (err) => {
			if (err) return reject(err);
			return resolve();
		});
	});
}

module.exports = {
	getPictureName: getPictureName,
	forceUpdate: forceUpdate,
	downloadImage: downloadImage,
	createFolders: createFolders
};


