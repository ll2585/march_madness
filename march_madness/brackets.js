var Bracket      = require('../Bracket.js');
var fs=require("fs");
var test_async = require('.././march_madness/test_async.js');

var mid_west_bracket_teams = test_async('./march_madness/midwest.csv');
var west_bracket_teams = test_async('./march_madness/west.csv');
var east_bracket_teams = test_async('./march_madness/east.csv');
var south_bracket_teams = test_async('./march_madness/south.csv');

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
	mid_west_bracket.insertToBottom(mid_west_bracket_teams[i]);
	west_bracket.insertToBottom(west_bracket_teams[i]);
	east_bracket.insertToBottom(east_bracket_teams[i]);
	south_bracket.insertToBottom(south_bracket_teams[i]);
}

tournament['mid_west'] = mid_west_bracket;
tournament['east'] = east_bracket;
tournament['west'] = west_bracket;
tournament['south'] = south_bracket;
tournament['championship'] = championship_bracket;
tournament['championship']['tree'][2]['score'] = null;
tournament['championship']['tree'][3]['score'] = null;
module.exports = function() {
	return tournament;
};