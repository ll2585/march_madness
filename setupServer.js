var serverSettings = require('./app/models/ServerSettings.js')
var initial_bracket = require('./march_madness/brackets.js')();

for(var region in initial_bracket){
    for(var node in initial_bracket[region]['tree']){
        initial_bracket[region]['tree'][node]['score'] = null;
        initial_bracket[region]['tree'][node]['region'] = region;
        initial_bracket[region]['tree'][node]['other_team'] = node % 2 == 0 ? parseInt(node) + 1 : node - 1;
    }
}
var money_categories = ["First Place", "Second Place", "Third Place","Sixth Place","Second to Last",
    "Most Guesses in MiniGame", "Winner after Day 1", "Winner after Day 2", "Most Correct Upsets in Round 1",
"Most Points in Squares", "Worst Pick", "Most Heartbreaking", "First to be Eliminated", "Most Correct Blue Teams",
    "Most Correct Red Teams", "Most Resistance Achievements", "Most Achievements", "Most Taylor Swift Achievements", "Closest To 50 Points"];
var money_category_dict = [];
for(var i = 0; i < money_categories.length; i++){
    var temp = {};
    temp['category'] = money_categories[i];
    temp['player'] = [];
    temp['score'] = 0;
    temp['final'] = false;
    temp['multiple'] = false;
    temp['info'] = null;
    temp['amount'] = null;
    money_category_dict.push(temp);
}
var achievements = ["Completed Bracket", "I Say I Like Dogs", "But I Really Like Cats", "Random Picker", "Good Guesser", "Inside Trader", "Minigame Champion", "My Best Friend",
    "Jackpot", "Numbers Whiz", "Possible Billionaire", "Two for Two", "25% Chance", "Frontrunner", "1 and Done", "Tough Luck", "18-1", "Payback", "Blackout", "A New Hope",
	"Knocked Out",	"Left Hook",	"Right Jab",	"Left Cross",	"Uppercut",	"Liver Shot",	"One Hit KO",	"Long Count",	"Journeyman", "Gatekeeper",	 "Contender",	"One-two Combo",	"Outpoint",  "Below the Belt",
	"Merlin", "Mordred", "Assassin", "Reverser", "Hunter", "Percival", "Lancelot", "Oberon", "Morgana", "Lady of the Lake", "Excalibur", "I'm feeling 22",
"You love the game", "I'm on the bleachers", "Remember how that lasted for a day?", "Haters gonna hate", "Burning red", "All there's left to do is run", "Now I'm lying on the cold hard ground", "We come back everytime"];

var initialSettings = [
	{setting: 'bracketOpened', type:'bool', val:true},
	{setting: 'officialBracket', type: 'obj', val: initial_bracket},
    {setting: 'scores', type: 'obj', val: []},
    {setting: 'moneyBoard', type: 'obj', val: money_category_dict},
    {setting: 'achievements', type: 'obj', val: achievements},
    {setting: 'achievementsByUser', type: 'obj', val: null},
	{setting: 'winning_numbers', type: 'obj', val: null},
	{setting: 'losing_numbers', type: 'obj', val: null},
	{setting: 'player_numbers', type: 'obj', val: null},
	{setting: 'boxWinningsByUser', type: 'obj', val: null},
	{setting: 'miniGameClosed', type: 'bool', val: null},
	{setting: 'miniGameOver', type: 'bool', val: null}
]
module.exports= {
    insertSettingsIntoMongo: function () {
        for (var i = 0; i < initialSettings.length; i++) {
            var curSetting = initialSettings[i];
            var setting = new serverSettings();
            setting.setting = curSetting['setting'];
            setting.type = curSetting['type'];
            setting.setVal(curSetting['val']);
            serverSettings.findOne({setting: curSetting['setting']}, function (err, result) {
                if (err || result == null) {
                    console.log("DOES NOT EXIST!!")
                    setting.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("OK!")
                        }

                    });
                }
            })


        }

    },
    initialSettings: function () {
        return initialSettings;
    }
}