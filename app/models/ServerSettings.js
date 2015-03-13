var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var Q = require('Q')
var Settings = new Schema({
	setting: { type: String, required: true, unique: true },
	type: { type: String, required: true },
	flag: { type: Boolean, required: false },
	value_int: { type: Number, required: false },
	value_string: { type: String, required: false },
	obj: {type: Object, required: false}
});

Settings.path('type').validate(function (value) {
	return /bool|int|string|obj/i.test(value);
}, 'Invalid color');

//Password verification
Settings.methods.getVal = function() {
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
Settings.methods.setVal = function(val) {
	var deferred = Q.defer()
	switch(this.type){
		case "bool":{
			this.flag = val;
			break;
		}
		case "int":{
			this.value_int = val;
			break;
		}
		case "string":{
			this.value_string = val;
			break;
		}
		case "obj":{
			this.obj = JSON.stringify(val); //stores a string
			break;
		}
	}
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
module.exports = mongoose.model('Settings', Settings);