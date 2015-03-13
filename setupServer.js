var serverSettings = require('./app/models/ServerSettings.js')
var initialSettings = [
	{setting: 'bracketOpened', type:'bool', val:true},
	{setting: 'officialBracket', type: 'obj', val: require('./march_madness/brackets.js')()}
]
module.exports = function() {
	for(var i = 0; i < initialSettings.length; i++){
		var curSetting = initialSettings[i];
		var setting = new serverSettings();
		setting.setting = curSetting['setting'];
		setting.type = curSetting['type'];
		setting.setVal(curSetting['val']);
		serverSettings.findOne({setting: curSetting['setting']}, function (err, result) {
			if (err || result == null) {
				console.log("DOES NOT EXIST!!")
				setting.save(function(err) {
					if (err) {
						console.log(err);
					}else{
						console.log("OK!")
					}

				});
			}
		})


	}

}