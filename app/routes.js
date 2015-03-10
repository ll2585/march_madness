var Bracket      = require('.././Bracket.js');
var User     = require('./models/User.js');
var jwt        = require("jsonwebtoken");
var expressJwt = require('express-jwt');
var secret = "SECRET TOKEN";
module.exports = function(app) {
    app.post('/register', function(req, res){
        var username = req.body.username || '';
        var password = req.body.password || '';
        var passwordConfirmation = req.body.passwordConfirmation || '';

        if (username == '' || password == '' || password != passwordConfirmation) {
            return res.sendStatus(400);
        }

        var user = new User();
        user.username = username;
        user.password = password;
		console.log("REGISTERING");
		console.log(username);
		console.log(password);
        user.save(function(err) {
            if (err) {
                console.log(err);
                return res.sendStatus(500);
            }

            User.count(function(err, counter) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }

                if (counter == 1) {
                    User.update({username:user.username}, {is_admin:true}, function(err, nbRow) {
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
    app.post('/logout', function(req, res){
        if (req.user) {

            delete req.user;
            return res.sendStatus(200);
        }
        else {
            return res.sendStatus(401);
        }
    });
    app.post('/login', function(req, res) {
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
				console.log("NOUSER");
                return res.status(401).send("No user by that name.");
            }

            user.comparePassword(password, function(isMatch) {
                if (!isMatch) {
                    console.log("Attempt failed to login with " + user.username);
                    return res.sendStatus(401);
                }

                var token = jwt.sign({id: user._id}, "SECRET TOKEN");

                return res.json({token:token});
            });

        });
    });



	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex ;

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

	for(var i = 0; i < 6; i++) {
		winning_numbers.push(shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));
		losing_numbers.push(shuffle([0, 9, 8, 7, 6, 5, 4, 3, 2, 1]));
	}

	var west_bracket = new Bracket();
	var users = ["Luke", "Dean", "Liana", "Jenny", "Steve", "Jolyn"];
	var boxes = [];
	while(boxes.length < 100){
		if(100-boxes.length < users.length){ //not even so fill with no one
			boxes.push("None");
		}else{
			for(var j = 0 ; j < users.length; j++){
				boxes.push(users[j]);
			}
		}
	}
	shuffle(boxes); //split it up into 10 arrays of size 10
	var players = [];
	var temp = [];
	for(var i = 0; i < boxes.length; i++){
		if((i%10)==0){
			if(temp.length == 10){
				players.push(temp);
			}
			var temp = [];
		}
		temp.push(boxes[i]);
	}
	players.push(temp);
	app.get('/boxes.json', function(req, res, next) {
		var json = {winning_numbers: winning_numbers, losing_numbers: losing_numbers, users: players};
		res.json(json);
	});

	var west_bracket = new Bracket();
	var east_bracket = new Bracket();
	var north_bracket = new Bracket();
	var south_bracket = new Bracket();
	var championship_bracket = new Bracket();
	west_bracket.makeTree(31);
	east_bracket.makeTree(31);
	north_bracket.makeTree(31);
	south_bracket.makeTree(31);
	championship_bracket.makeTree(7);
	var tournament = {};
	for(var i = 0; i < 16; i++){
		west_bracket.insertToBottom("Team " + i);
		east_bracket.insertToBottom("Team " + i);
		north_bracket.insertToBottom("Team " + i);
		south_bracket.insertToBottom("Team " + i);

	}
	tournament['west'] = west_bracket;
	tournament['east'] = east_bracket;
	tournament['south'] = south_bracket;
	tournament['north'] = north_bracket;
	tournament['championship'] = championship_bracket;
	app.get('/brackets.json', function(req, res, next) {
		var json = tournament;
		res.json(json);
	});

	app.all('/*', function(req, res, next) {
		console.log("WE RENDERING" + req.path);
		var arbitraryUrls = ['partials', 'api'];
		if (arbitraryUrls.indexOf(req.url.split('/')[1]) > -1) {
			next();
		} else {
			res.render('index');
		}
	});

	app.get('/partials/box', function(req, res, next) {
		res.render('.' + req.path, {winning_numbers: winning_numbers, losing_numbers: losing_numbers, boxes: boxes, curUser: "Luke"});
	});
	app.get('/partials/*', function(req, res, next) {
		console.log("WE RENDERING" + req.path);
		res.render('.' + req.path);
	});
};