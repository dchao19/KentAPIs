var getPictureName = function(numericalDOW, lunchSource, callback){
	if(numericalDOW === 0 || numericalDOW === 6) numericalDOW = 1;
	
	for(var i = 1; i <= numericalDOW; i++){
		lunchSource = lunchSource.substring(lunchSource.indexOf("data-objid=") + 12);
		console.log(lunchSource.indexOf("data-objid="));
		if(i == numericalDOW) {
			callback(lunchSource.substring(0, lunchSource.indexOf(">") - 1));
		}
		else lunchSource.replace("data-objid=", "notneeded=");
	}
}

module.exports = {
	getPictureName: getPictureName
};


