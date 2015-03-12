var Bracket      = require('../Bracket.js');
var fs = require('fs');
var mid_west_bracket_teams = fs.readFileSync('./march_madness/midwest.txt').toString().split("\n");
var west_bracket_teams = fs.readFileSync('./march_madness/west.txt').toString().split("\n");
var east_bracket_teams = fs.readFileSync('./march_madness/east.txt').toString().split("\n");
var south_bracket_teams = fs.readFileSync('./march_madness/south.txt').toString().split("\n");

var mid_west_bracket = new Bracket();
var east_bracket = new Bracket();
var west_bracket = new Bracket();
var south_bracket = new Bracket();
var championship_bracket = new Bracket();
mid_west_bracket.makeTree(31);
east_bracket.makeTree(31);
west_bracket.makeTree(31);
south_bracket.makeTree(31);
championship_bracket.makeTree(7);
var tournament = {};
for(var i = 0; i < mid_west_bracket_teams.length; i++){
	mid_west_bracket.insertToBottom({'name': mid_west_bracket_teams[i]});
	west_bracket.insertToBottom({'name': west_bracket_teams[i]});
	east_bracket.insertToBottom({'name': east_bracket_teams[i]});
	south_bracket.insertToBottom({'name': south_bracket_teams[i]});
}

tournament['mid_west'] = mid_west_bracket;
tournament['east'] = east_bracket;
tournament['west'] = west_bracket;
tournament['south'] = south_bracket;
tournament['championship'] = championship_bracket;

module.exports = function() {
	return tournament;
};