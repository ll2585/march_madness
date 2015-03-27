function Ability(name) {
    this.name = name;
}

Ability.prototype = {
    encrypted: function (salt) {
        return {
            name: encrypt(this.name, salt)
        }
    }
}
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr'

function encrypt(text, password){
    var algorithm = 'aes-256-ctr';
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text, password){
    var algorithm = 'aes-256-ctr';
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}
var silence = new Ability("Silence");
var sentinel = new Ability("Sentinel");
var clone = new Ability("Clone");
var gravity = new Ability("Gravity")
var swapper = new Ability("Swapper")
var push = new Ability("Push")
var union = new Ability("Union")
var mirror = new Ability("Mirror")
var jumper = new Ability("Jumper")
var together = new Ability("Together")
var resetter = new Ability("Resetter")
var onlooker = new Ability("Onlooker")
var eliminator = new Ability("Eliminator")
var repository = new Ability("Repository")

var abilities = [
    silence, sentinel, clone, gravity, swapper, push, union, mirror, jumper, together, resetter, onlooker, eliminator, repository
];

/*
 * 1	silence	disable someone's power
 2	sentinel	choose another player besides yourself - that player cant be moved
 3	clone	choose a player; any time that player is targetted, you are targetted instead, and vice versa
 4	gravity	choose someone ahead of you or behind you; if they are ahead of you, they lose 1/3 the difference, If they are behind you, they gain 1/3 the difference
 5	swapper	choose a player, that player will swap points with the person ahead of them (can be yourself)
 6	push	everyone <10 pts ahead of you gets 10 pts, everyone <10 pts behind you loses 10 pts
 7	union	everyone 10-20 pts ahead of you loses 10 pts; if less than 3 ppl then the 3 ppl ahead of you lose 6/11/16 points
 8	mirror	choose another player - if you gained points they lose that many points and vice versa
 9	jumper	if you lost any points, you gain double what you lost
 10	Together	choose an inactive player - if they gained or lost any points, you gain or lose those points as well, and vice versa.
 11	Resetter	choose another player; that player's points get reset to what they were before, if they would have at least as many points as you have
 12	Onlooker	choose 5 players. Will tell you 3 original roles of the 5.
 13	Eliminator	choose 3 players. Will tell you who they are not originally (3 eliminations per player).
 14	Repository	choose 3 players. Will tell you which games they are playing originally (but not who is playing which game)

 */

module.exports = exports = abilities;