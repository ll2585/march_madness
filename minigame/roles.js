function Role(name, team, game) {
	this.name = name;
	this.team = team;
	this.game = game;
	this.salt = randomSalt();
}
function randomSalt()
{
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < 5; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}
Role.prototype = {
	encrypted: function () {
		return {
			name: encrypt(this.name, this.salt),
			team: encrypt(this.team, this.salt),
			game: encrypt(this.game, this.salt),
			salt: this.salt
		}
	}
}
var crypto = require('crypto'),
	algorithm = 'aes-256-ctr'

function encrypt(text, password){
	var cipher = crypto.createCipher(algorithm,password)
	var crypted = cipher.update(text,'utf8','hex')
	crypted += cipher.final('hex');
	return crypted;
}

function decrypt(text, password){
	var decipher = crypto.createDecipher(algorithm,password)
	var dec = decipher.update(text,'hex','utf8')
	dec += decipher.final('utf8');
	return dec;
}
var president = new Role("President", "Blue", "2R1B");
var bomber = new Role("Bomber", "Red", "2R1B");
var werewolf1 = new Role("Werewolf1", "Werewolf", "ONUW");
var werewolf2 = new Role("Werewolf2", "Werewolf", "ONUW");
var seer = new Role("Seer", "Village", "ONUW");
var robber = new Role("Robber", "Village", "ONUW");
var troublemaker = new Role("Troublemaker", "Village", "ONUW");
var minion = new Role("Minion", "Werewolf", "ONUW");
var doctor = new Role("Doctor", "Blue", "2R1B");
var engineer = new Role("Engineer", "Red", "2R1B");
var fugitive = new Role("Fugitive", "Red", "2R1B");
var witness = new Role("Witness", "Red", "2R1B");
var one_armed_man = new Role("One Armed Man", "Blue", "2R1B");
var marshall = new Role("Marshall", "Blue", "2R1B");

var roles = [
	president, bomber, werewolf1, werewolf2, seer, robber, troublemaker, minion, doctor, engineer, fugitive, witness, one_armed_man, marshall
];

module.exports = exports = roles;