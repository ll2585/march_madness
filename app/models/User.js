var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var bcrypt       = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;
var generated_password = require('./password-generator');
var sendgrid  = require('sendgrid')('luke_march_madness', 'HVJr1rcT6zAU51Q');

var User = new Schema({
	username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
	password: { type: String, required: false },
	is_admin: { type: Boolean, default: false },
	created: { type: Date, default: Date.now }
});

// Bcrypt middleware on UserSchema
User.pre('save', function(next) {
    var user = this;
    var password = generated_password();
    user.password = password;
    console.log(password);


    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, '',function(err, hash) {
            if (err) return next(err);
            var email     = new sendgrid.Email({
                to:       user.email,
                from:     'you@yourself.com',
                subject:  'Subject goes here',
                text:     'Your password is ' + user.password
            });
            sendgrid.send(email, function(err, json) {
                if (err) { return console.error(err); }
                console.log(json);
            });
            user.password = hash;
            next();
        });
    });
});

//Password verification
User.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(isMatch);
    });
};

module.exports = mongoose.model('User', User);