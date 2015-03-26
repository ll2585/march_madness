var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var Q = require('q')
var MiniGame = new Schema({
	username: { type: String, required: true, unique: true },
    original_role: {type: Object}, //encoded
    original_salt: {type: String},
    believed_role: { type: Object }, //encoded
    believed_salt: {type: String},
    role: { type: Object }, //encoded
    salt: {type: String},
	actions_did: { type: Object  }, //encoded
	guesses: { type: Object, required: false },
	power: {type: String, required: false},
	power_cur_target: {type: String, required: false}, //encoded
	power_string:{type: String, required: false},
	pre_end_points: {type: Number, required: false},
	adjustment_points: {type: Number, required: false}

});

//has to be a promise
MiniGame.methods.setRole = function(val) {
	//encrypt the role first
	var deferred = Q.defer()
	this.role = val;
	this.save(function(err) {
		if (err){
			console.log(err)
			deferred.reject(err)
		}
		else{
			console.log('GOOD!')
			deferred.resolve(true)
		}

	});
	return deferred.promise
};
module.exports = mongoose.model('MiniGame', MiniGame);