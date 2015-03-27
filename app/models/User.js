var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var bcrypt       = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;
var generated_password = require('./password-generator');
var sendgrid  = require('sendgrid')(process.env.SENDGRID_USERNAME_LUKE, process.env.SENDGRID_PASSWORD_LUKE)
//local :('luke_march_madness', 'HVJr1rcT6zAU51Q');

var User = new Schema({
	username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
	password: { type: String, required: false },
	is_admin: { type: Boolean, default: false },
	created: { type: Date, default: Date.now },
	flags: {type: Object, default: {skipped_main_page: false}},
	bracket: {type: Object, default: {}}
});

// Bcrypt middleware on UserSchema
User.pre('save', function(next) {
    var user = this;
    var password = generated_password();
    user.password = password;


    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, '',function(err, hash) {
            if (err) return next(err);
            var email     = new sendgrid.Email({
                to:       user.email,
                from:     'luke@luke.com',
                subject:  'Welcome to March Madness Madness 2015!',
                text:     'Your password is ' + user.password + ' DO NOT LOSE THIS EMAIL BECAUSE IT IS UNRECOVERABLE'
            });
            sendgrid.send(email, function(err, json) {
                if (err) { return console.error(err); }
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