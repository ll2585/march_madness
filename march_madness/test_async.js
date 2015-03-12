
var fs=require("fs");

module.exports = function(csvFileName){
	var result = [];
	var fileContents = fs.readFileSync(csvFileName);
	var lines = fileContents.toString().trim().split('\n');

	var headers = lines[0].toString().trim().split(',');
	for(var i = 1; i < lines.length; i++){ //skip header
		var splitted_line = lines[i].toString().trim().split(',');
		var temp = {};
		for(var j = 0; j < splitted_line.length; j++){
			temp[headers[j]] = splitted_line[j];
		}
		result.push(temp);
	}
	return result;
}