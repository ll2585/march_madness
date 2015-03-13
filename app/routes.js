var tournament      = require('.././march_madness/brackets.js')();
var User     = require('./models/User.js');
var jwt        = require("jsonwebtoken");
var expressJwt = require('express-jwt');
var secret = require('./secret.js');
var Q = require('Q');
var api = require('./api.js');
var ServerSettings     = require('./models/ServerSettings.js');
var settings = {'bracketOpened': false, 'officialBracket': null}; //get settings first - cache settings so we dont connect to db all the time
console.log("!@$@%");
var settings_loaded = false;
for(var s in settings){
	ServerSettings.findOne({setting: s}, function (err, result) {
		if (err) {
			console.log(err);
			return res.status(401).send("No finding.");
		}
		if (result == undefined) {
			console.log("NO NAME")
			return res.status(401).send("No setting with that name.");
		}
		settings[s] = result.getVal();
		settings_loaded = true;
		console.log("DSBSDBBS")
		console.log(settings_loaded);
	})
}

module.exports = function(app) {
	app.use('/api', expressJwt({
		secret: secret()
	}).unless({path: ['/api/auth', '/api/things', '/api/auth/signup']}));

	function isLuke(req, res, next) {

		// do any checks you want to in here
		console.log(req.session);
		// CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
		// you can do this however you want with whatever variables you set up
		if (req.session.token !== undefined) {
			var decoded = jwt.verify(req.session.token, secret());
			User.findOne({_id: decoded.id}, function (err, user) {
				if (err) {
					console.log(err);
					return res.sendStatus(401).send("COLDNT FIND");;
				}
				var is_admin = user.is_admin;
				if (is_admin) {
					console.log("LUKE!!")
					next();
				} else {
					console.log("NOT LUKE?!")
					return res.status(401).send("NOT LUKE BITCH");
				}
			});


		}

		// IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
		else {
			res.redirect('/');
		}

	}

	app.get('/admin', isLuke, function (req, res) {
		console.log("GOING HOME");
		return res.render("admin")
	});
	app.post('/admin/setSetting', isLuke, function (req, res) {
		var deferred = Q.defer()
		var setting = req.body.setting;
		var val = req.body.val;
		ServerSettings.findOne({setting: setting}, function (err, result) {
			console.log(setting);
			if (err) {
				console.log(err);
				return res.status(401).send("Some error.");
			}
			if (result == undefined) {
				console.log("NO NAME")
				return res.status(401).send("No setting with that name.");
			}
			console.log(result.getVal());
			console.log("SETTING " + setting + " to " + val);
			(result.setVal(val)).then(function(data){
				settings[setting] = val; //cache setting
				deferred.resolve(res.status(212).send("Success!"));
			}).catch(function(e){
				console.log("?DFVD")
				return res.status(401).send("Could not save.");
			});
		})
		return deferred.promise

	});
	app.get('/admin/getSetting', isLuke, function (req, res) {
		var setting = req.query.setting;
		return res.json({'result': settings[setting]});
	});

	app.get('/admin/getAllSettings', isLuke, function (req, res) {
		return res.json(settings);
	});

	app.get('/async.json', function (req, res) {
		return res.json(test);
	});

	app.post('/register', function (req, res) {
		var username = req.body.username || '';
		var email = req.body.email || '';
		var name = req.body.name || '';

		if (username == '' || email == '' || name == '') {
			return res.sendStatus(400);
		}

		var user = new User();
		user.username = username;
		user.email = email;
		user.name = name;
		console.log("REGISTERING");
		console.log(username);
		console.log(name);
		user.save(function (err) {
			if (err) {
				console.log(err);
				return res.sendStatus(500);
			}

			User.count(function (err, counter) {
				if (err) {
					console.log(err);
					return res.sendStatus(500);
				}

				if (counter == 1) {
					User.update({username: user.username}, {is_admin: true}, function (err, nbRow) {
						if (err) {
							console.log(err);
							return res.sendStatus(500);
						}

						console.log('First user created as an Admin');
						return res.sendStatus(200);
					});
				}
				else {
					return res.sendStatus(200);
				}
			});
		});
	});
	app.post('/logout', function (req, res) {
		if (req.user) {

			delete req.user;
			return res.sendStatus(200);
		}
		else {
			return res.sendStatus(401);
		}
	});
	app.post('/login', function (req, res) {
		var username = req.body.username || '';
		var password = req.body.password || '';

		if (username == '' || password == '') {
			return res.sendStatus(401);
		}

		User.findOne({username: username}, function (err, user) {
			if (err) {
				console.log(err);
				return res.sendStatus(401);
			}

			if (user == undefined) {
				return res.status(401).send("No user by that name.");
			}

			user.comparePassword(password, function (isMatch) {
				if (!isMatch) {
					console.log("Attempt failed to login with " + user.username);
					return res.status(401).send("Incorrect password.");
				}
				req.user = user;
				console.log("SET REQ USER")
				console.log(req.user);
				console.log(req.session);


				var token = jwt.sign({id: user._id}, secret());
				req.session['token'] = token;
				console.log("ADDED THE TOKEN!??!")
				console.log(req.session);
				return res.json({token: token, user: user});
			});

		});
	});

	app.get('/getFlags', function (req, res) {
		console.log("LOS FLAGOS");
		var username = req.query.username;
		var token = req.query.token;
		var decoded = jwt.verify(token, secret());
		User.findOne({username: username}, function (err, user) {
			console.log(user);
			console.log(user.flags);
			if (err) {
				console.log(err);
				return res.sendStatus(401);
			}
			if (user._id == decoded.id) {
				return res.json(user.flags);
			}
		});
	});

	app.post('/savebracket', function (req, res) {
		var username = req.body.username;
		var token = req.body.token;
		var bracket = req.body.bracket;
		var decoded = jwt.verify(token, secret());
		User.findOne({username: username}, function (err, user) {
			console.log(user);
			console.log(user.flags);
			if (err) {
				console.log(err);
				return res.sendStatus(401);
			}
			if (user._id == decoded.id) {
				console.log(bracket['mid_west']['tree']);
				var partial_update = {$set: {bracket: bracket}};
				User.findOneAndUpdate({username: username}, partial_update, function (err) {
					if (err) {
						console.log("ERRROR");
						console.log(err);
					} else {
						res.sendStatus(212);
					}
				});
			}
		});
	});
	app.get('/bracket_joyride.json', function (req, res) {
		return res.json({"1": "HI!"});
	});

	app.get('/savedBracket.json', function (req, res) {
		var username = req.query.username;
		console.log(username);
		User.findOne({username: username}, function (err, user) {
			if (err) {
				console.log(err);
				return res.sendStatus(404);
			}
			else {
				var bracket = user.bracket;
				if (Object.keys(bracket).length == 0) {
					return res.status(404).send("No bracket found");
				} else {
					return res.json(bracket);
				}

			}
		});
	});

	app.post('/setFlags', function (req, res) {

		var username = req.body.username;
		var token = req.body.token;
		var flag = req.body.flag;
		var val = req.body.val;
		var decoded = jwt.verify(token, secret());
		console.log("SETTING FLAGS " + flag + " TO " + val);
		User.findOne({username: username}, function (err, user) {
			console.log(user);
			console.log(user.flags);
			if (err) {
				console.log(err);
				return res.sendStatus(401);
			}
			if (user._id == decoded.id) {
				var new_flag = "flags." + flag;
				var new_set = {}
				new_set[new_flag] = val;
				var updated_flag = {$set: new_set};
				console.log(updated_flag);
				User.findOneAndUpdate({username: username}, updated_flag, function (err) {
					if (err) {
						console.log(err);
					} else {
						res.sendStatus(212);
					}
				});
			}
		});
	});


	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	var winning_numbers = [];
	var losing_numbers = [];

	for (var i = 0; i < 6; i++) {
		winning_numbers.push(shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));
		losing_numbers.push(shuffle([0, 9, 8, 7, 6, 5, 4, 3, 2, 1]));
	}

	var users = ["luke", "Dean", "Liana", "Jenny", "Steve", "Jolyn", "Elaine", "Lillian", "Jane", "Liping", "Alex", "Kawin"];
	var boxes = [];
	while (boxes.length < 100) {
		if (100 - boxes.length < users.length) { //not even so fill with no one
			boxes.push("None");
		} else {
			for (var j = 0; j < users.length; j++) {
				boxes.push(users[j]);
			}
		}
	}
	shuffle(boxes); //split it up into 10 arrays of size 10
	var players = [];
	var temp = [];
	for (var i = 0; i < boxes.length; i++) {
		if ((i % 10) == 0) {
			if (temp.length == 10) {
				players.push(temp);
			}
			var temp = [];
		}
		temp.push(boxes[i]);
	}
	players.push(temp);
	app.get('/boxes.json', function (req, res, next) {
		var json = {winning_numbers: winning_numbers, losing_numbers: losing_numbers, users: players};
		res.json(json);
	});


	app.get('/brackets.json', function (req, res, next) {
		var json = tournament;
		res.json(json);
	});

	app.all('/*', function (req, res, next) {
		console.log("WE RENDERING" + req.path);
		var arbitraryUrls = ['partials'];
		if (arbitraryUrls.indexOf(req.url.split('/')[1]) > -1) {
			next();
		} else {
			res.render('index');
		}
	});

	app.get('/partials/box', function (req, res, next) {
		res.render('.' + req.path, {
			winning_numbers: winning_numbers,
			losing_numbers: losing_numbers,
			boxes: boxes,
			curUser: "Luke"
		});
	});
	app.get('/partials/bracket-angular', function (req, res, next) {
		console.log(settings);
		var setting = "bracketOpened";
		res.render('.' + req.path, {opened: settings[setting]});

	});
	app.get('/partials/*', function (req, res, next) {
		console.log("WE RENDERING" + req.path);
		res.render('.' + req.path);
	});
};