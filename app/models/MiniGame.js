var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var Q = require('q')
var MiniGame = new Schema({
	username: { type: String, required: true, unique: true },
	role: { type: String },
	actions_did: { type: String  },
	guesses: { type: Object, required: false }

});

//Password verification
MiniGame.methods.getVal = function() {
	console.log(this);
	switch(this.type){
		case "bool":{
			return this.flag;
			break;
		}
		case "int":{
			return this.value_int;
			break;
		}
		case "string":{
			return this.value_string;
			break;
		}
		case "obj":{
			return JSON.parse(this.obj); //returns an object
			break;
		}
	}
};
//has to be a promise
MiniGame.methods.set_action = function(val) {
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