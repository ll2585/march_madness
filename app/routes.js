var tournament      = require('.././march_madness/brackets.js')();
var User     = require('./models/User.js');
var jwt        = require("jsonwebtoken");
var mongoose     = require('mongoose');
var expressJwt = require('express-jwt');
var secret = require('./secret.js');
var Q = require('q');
var ServerSettings     = require('./models/ServerSettings.js');
var MiniGame     = require('./models/MiniGame.js');
var setUpServer = require('../setupServer.js');
var settings = {'bracketOpened': false, 'officialBracket': null, 'scores': null, 'moneyBoard': null, 'achievements': null, 'achievementsByUser': null,
'winning_numbers': null, 'losing_numbers': null, 'player_numbers': null, 'boxWinningsByUser': null, 'miniGameClosed': null, 'miniGameOver': null, 'miniGameEmailsSent': null, 'miniGameActions': null, 'miniGameScoreboard': null}; //get settings first - cache settings so we dont connect to db all the time
var settings_loaded = false;
var initial_settings = setUpServer.initialSettings()
for(var s in settings){
    storeAsSetting(s)
}
var minigame_cached = [];
function cacheMinigame(){
    minigame_cached = [];
    console.log("CACHING MINIGAME")
    MiniGame.find({}, function(err, users) {
        if (err) {
            console.log(err);
            return res.sendStatus(401);
        }
        var users_list = [];

        users.forEach(function(user) {
            minigame_cached.push(user);
        });

    });
}

cacheMinigame();

var roles        = require("../minigame/roles.js");
var abilities        = require("../minigame/abilities.js");
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

function storeAsSetting(s){
    ServerSettings.findOne({setting: s}, function (err, result) {
        if (err) {
            console.log(err);
        }
        if (result == undefined) {
            console.log("NO NAME in mongo for " + s)

            for(var i = 0; i < initial_settings.length; i++){
                if(initial_settings[i]["setting"] == s){
                    settings[s] = initial_settings[i]["val"];
                }
            }
        }else{
            settings[s] = result.getVal();
            settings_loaded = true;
        }

    })
}

function userPaid(req){
    var deferred = Q.defer()
    var setting = req.body.setting;
    var val = req.body.val;

    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1")
    if (req.session.token !== undefined) {
        var decoded = jwt.verify(req.session.token, secret());
        User.findOne({_id: decoded.id}, function (err, user) {
            if (err) {
                console.log(err);

                return res.sendStatus(401).send("COLDNT FIND");;
            }
            var paid = user.flags.paid;
            console.log("!!!!!" + paid);
            if(paid == null || paid == undefined){
                paid =  false;
            }
            deferred.resolve(paid);
        });



    }else {
        deferred.resolve(true);
    }
    return deferred.promise;
}
module.exports = function(app) {


	function isLuke(req, res, next) {

		// do any checks you want to in here
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
					next();
				} else {
					return res.status(401).send("NOT LUKE BITCH");
				}
			});


		}

		// IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
		else {
            console.log("NOT LOGGED IN")
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
			if (err) {
				console.log(err);
				return res.status(401).send("Some error.");
			}
			if (result == undefined) {
				console.log("NO NAME")
				return res.status(401).send("No setting with that name.");
			}
			console.log("SETTING " + setting + " to " + val);
            result.setVal(val)
            result.save(function (err) {
                if (err) {
                    console.log(err);
                    console.log("SEERROR");
                    return res.status(401).send("Could not save.");
                }
                settings[setting] = val; //cache setting
                console.log("SSuccess!");
                deferred.resolve(res.status(212).send("Success!"));
            });
		})
		return deferred.promise

	});
	app.get('/admin/getSetting', isLuke, function (req, res) {
		var setting = req.query.setting;
		return res.json({'result': settings[setting]});
	});

    app.post('/admin/changeUserPaid', isLuke, function (req, res) {
        var userid = req.body.usersid;
        var bool = req.body.val;
        var new_flag = "flags.paid";
        var new_set = {};
        new_set[new_flag] = bool;
        var updated_flag = {$set: new_set};
        User.findOneAndUpdate({_id: userid}, updated_flag, function (err, user) {
            if (err) {
                console.log(err);
            } else {
                console.log("SUCCESS")
                res.sendStatus(212);
            }
        });
    });

    app.post('/admin/endMinigame', isLuke, function (req, res) {

    });




	app.get('/is_bracket_opened.json', function (req, res) {
		var setting = 'bracketOpened'
		return res.json({'result': settings[setting]});
	});


	app.get('/admin/getAllSettings', isLuke, function (req, res) {
		return res.json(settings);
	});

	app.get('/admin/getMiniGamePlayers', isLuke, function (req, res) {
        User.find({"flags.said_yes_to_playing_minigame": true}, function(err, users) {
            if (err) {
                console.log(err);
                return res.sendStatus(401);
            }
            var users_list = [];

            users.forEach(function(user) {
                users_list.push(user.username);
            });

            return res.json(users_list);
        });
    });
    app.post('/admin/getMiniGamePlayersEmails', isLuke, function (req, res) {
        User.find({"flags.said_yes_to_playing_minigame": true}, function(err, users) {
            if (err) {
                console.log(err);
                return res.sendStatus(401);
            }
            var users_list = {};

            users.forEach(function(user) {
                users_list[user.username] = {email: user.email};
            });

            MiniGame.find({}, function(err, mgusers) {
                if (err) {
                    console.log(err);
                    return res.sendStatus(401);
                }

                mgusers.forEach(function(mguser) {
                    users_list[mguser.username]['role'] = decrypt(mguser.original_role.name, mguser.original_salt);
                    users_list[mguser.username]['power'] = decrypt(mguser.power, mguser.original_salt);
                });

                var sendgrid  = require('sendgrid')(process.env.SENDGRID_USERNAME_LUKE, process.env.SENDGRID_PASSWORD_LUKE)
                for(var u in users_list) {
                    if (u == "Luke"){
                        var email = new sendgrid.Email({
                            to: users_list[u].email,
                            from: 'luke@luke.com',
                            subject: 'March Madness Madness 2015 MINIGAME INFORMATION!',
                            text: 'Welcome to the MINIGAME!!!!! You are the ' +  users_list[u].role + ' and your special ability is ' +  users_list[u].power + "!!!!!\r\nIf you have no idea what this means, go to https://enigmatic-bayou-1458.herokuapp.com/minigame !!!"
                        });
                    sendgrid.send(email, function (err, json) {
                        if (err) {
                            return console.error(err);
                        }
                    });
                    }
                }


                return res.json(users_list);
            });
        });
    });
	app.get('/admin/getMiniGamePlayersAndRoles', isLuke, function (req, res) {
		MiniGame.find({}, function(err, users) {
			if (err) {
				console.log(err);
				return res.sendStatus(401);
			}
			var users_list = [];

			users.forEach(function(user) {
				users_list.push(user);
			});

			return res.json(users_list);
		});
	});
    function randomSalt()
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 5; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
    function randomLetters(chars)
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < chars; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
	app.post('/admin/startMinigame', isLuke, function (req, res) {
		var setting = 'miniGameClosed'
		if(settings[setting]){
            console.log("OKAYT WE ARE DOING NEW MINIGAME MAYUBE?!?!?")
            mongoose.connection.db.dropCollection('minigames', function(err, result) {
                var players = req.body.players;
                var player_arr = [];
                shuffle(players);
                shuffle(roles);
                shuffle(abilities);
                var seer, robber, troublemaker;
                var robber_role = null;

                for(var i = 0; i < players.length; i++){
                    var roleMatch = new MiniGame();
                    roleMatch.username = players[i];
                    roleMatch.original_salt = randomSalt();
                    roleMatch.salt = randomSalt();
                    roleMatch.believed_salt = randomSalt();
                    if(roles[i].name == "Seer"){
                        seer = roleMatch;
                    }else if(roles[i].name == "Robber"){
                        robber_role = roles[i].encrypted(roleMatch.original_salt);
                        robber = roleMatch;
                    }else if(roles[i].name == "Troublemaker"){
                        troublemaker = roleMatch;
                    }
                    roleMatch.original_role = roles[i].encrypted(roleMatch.original_salt); //.encrpyted with salt1
                    roleMatch.power = abilities[i].encrypted(roleMatch.original_salt).name; //.encrpyted with salt1
                    console.log("GIVING " + abilities[i].name + " TO " + roleMatch.username)
                    roleMatch.role = roles[i].encrypted(roleMatch.salt); //.encrpyted with salt2
                    roleMatch.believed_role = roles[i].encrypted(roleMatch.believed_salt); //.encrpyted with salt2
                    player_arr.push(roleMatch);
                }
                var random_seered = player_arr[Math.floor(Math.random()*player_arr.length)];

                while(random_seered.username == seer.username){
                    random_seered = player_arr[Math.floor(Math.random()*player_arr.length)];
                }

                var random_robbed = player_arr[Math.floor(Math.random()*player_arr.length)];
                while(random_robbed.username == robber.username){
                    random_robbed = player_arr[Math.floor(Math.random()*player_arr.length)];
                }
                var robbed_role = random_robbed.role;
                var robbed_salt = random_robbed.salt;
                random_robbed.role = robber_role;
                random_robbed.salt = robber.salt;
                robber.role = robbed_role;
                robber.salt = robbed_salt;

                var random_troublemaker1 = player_arr[Math.floor(Math.random()*player_arr.length)];
                while(random_troublemaker1.username == troublemaker.username){
                    random_troublemaker1 = player_arr[Math.floor(Math.random()*player_arr.length)];
                }
                var random_troublemaker2 = player_arr[Math.floor(Math.random()*player_arr.length)];
                while(random_troublemaker2.username == troublemaker.username || random_troublemaker2.username == random_troublemaker1.username){
                    random_troublemaker2 = player_arr[Math.floor(Math.random()*player_arr.length)];
                }
                var tm_1_role = random_troublemaker1.role;
                var tm_1_salt = random_troublemaker1.salt;
                random_troublemaker1.role = random_troublemaker2.role;
                random_troublemaker1.salt = random_troublemaker2.salt;
                random_troublemaker2.role = tm_1_role;
                random_troublemaker2.salt = tm_1_salt;
                for(var i = 0; i < player_arr.length; i++){
                    var player = player_arr[i];
                    if(decrypt(player.original_role.name,player.original_salt)  == "Seer"){
                        player.actions_did = "You saw " + random_seered.username + "; THEY ARE THE " + decrypt(random_seered.original_role.name, random_seered.original_salt) + "! Or at least they were before the robber and the troublemaker struck. "
                    }else if(decrypt(player.original_role.name,player.original_salt) == "Robber"){
                        player.actions_did = "You robbed " + random_robbed.username + "; Now you are THE " + decrypt(robbed_role.name, robbed_salt) + "!!! Or at least you are before the troublemaker struck."
                        player.believed_role = {name: encrypt(decrypt(robbed_role.name, robbed_salt), player.believed_salt),
                            team: encrypt(decrypt(robbed_role.team, robbed_salt), player.believed_salt),
                            game: encrypt(decrypt(robbed_role.game, robbed_salt), player.believed_salt)};
                    }else if(decrypt(player.original_role.name,player.original_salt) == "Troublemaker"){
                        player.actions_did = "You swapped " + random_troublemaker1.username + " and " + random_troublemaker2.username + ". Now they will never who each other is!!! Unfortunately, neither do you."
                    }else{
                        player.actions_did = "Blahblahlbalhlslbdlf actually this is just filler because this person si not a special cahrafyer oops " + randomLetters(Math.floor(Math.random()*10));
                    }
                    player.power_string = "Blahblahlbalhlslbdlf actually this is just filler because this person si not a special cahrafyer oops " + randomLetters(Math.floor(Math.random()*10));
                    player.power_string = encrypt(player.power_string, player.original_salt);
                    player.actions_did = encrypt(player.actions_did, player.salt);

                }
                minigame_cached = []
                for(var i = 0; i < player_arr.length; i++){
                    minigame_cached.push(player_arr[i]);
                    player_arr[i].save(function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }

                return res.json({'roles': roles});
            });


		}else{
			return res.json({'nope': "ERROR"})
		}

	});

	app.get('/async.json', function (req, res) {
		return res.json(test);
	});

	app.post('/register', function (req, res) {
		if(!settings['bracketOpened']){
			return res.status(409).send("Brackets opened, signups closed.");
		}

		var username = req.body.username || '';
		var email = req.body.email || '';

		if (username == '' || email == '') {
			return res.sendStatus(400);
		}
		var user_exists = false;
		User.findOne({username: username}, function (err, user) {
			user_exists = err || user == undefined
			if(!user_exists){
				return res.status(409).send("User exists already.");
			}
			User.findOne({email: email}, function (err, user) {
				user_exists = err || user == undefined
				if(!user_exists){
					return res.status(409).send("Email exists already.");
				}

				var user = new User();
				user.username = username;
				user.email = email;
				console.log("REGISTERING");
				console.log(username);
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

								console.log('First user created as an Admin - username: ' + user.username);
								return res.sendStatus(200);
							});
						}
						else {
							console.log("TWOHUNDRED")
							return res.sendStatus(200);
						}

						//add to scoreboard here
					});
				});
			});

		});


	});
	app.post('/logout', function (req, res) {
		if (req.user) {

			delete req.user;
            console.log("BYEBYE")
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


				var token = jwt.sign({id: user._id}, secret());
				req.session['token'] = token;

				return res.json({token: token, user: user});
			});

		});
	});
    app.get('/getUsers.json', function (req, res) {
        User.find({}, function(err, users) {
            if (err) {
                console.log(err);
                return res.sendStatus(401);
            }
            var users_arr = [];

            users.forEach(function(user) {
                users_arr.push({'name': user.username});
            });

            return res.json(users_arr);
        });
    });
    app.get('/admin/getUserData.json', isLuke, function (req, res) {
        User.find({}, function(err, users) {
            if (err) {
                console.log(err);
                return res.sendStatus(401);
            }
            var user_map = {};

            users.forEach(function(user) {
                user_map[user._id] = user;
            });

            return res.json(user_map);
        });
    });
	app.get('/getFlags', function (req, res) {
		console.log("LOS FLAGOS");
		var username = req.query.username;
		var token = req.query.token;
		var decoded = jwt.verify(token, secret());
		User.findOne({username: username}, function (err, user) {
			if (err) {
				console.log(err);
				return res.sendStatus(401);
			}
			if (user._id == decoded.id) {
				return res.json(user.flags);
			}
		});
	});
    app.get('/getMiniGameRole.json', function (req, res) {
        var username = req.query.username;
        MiniGame.findOne({username: username}, function (err, user) {
            if (err) {
                console.log(err);
                return res.sendStatus(401);
            }
            var info = {}

            info['role'] = {'game':
                decrypt(user.believed_role.game, user.believed_salt),
                'name':
                    decrypt(user.believed_role.name, user.believed_salt),
                'team':
                    decrypt(user.believed_role.team, user.believed_salt)
            };
            info['actions_did'] = decrypt(user.actions_did, user.salt);
			info['guesses'] = user.guesses;
            info['abilities'] = decrypt(user.power, user.original_salt);
            if(user.power_cur_target){
                info['curTargets'] = JSON.parse(decrypt(user.power_cur_target, user.original_salt));
            }
            info['power_string'] = decrypt(user.power_string, user.original_salt);

            return res.json(info);
        });
    });
	app.post('/saveGuesses', function (req, res) {
		var username = req.body.username;
		var token = req.body.token;
		var guesses = req.body.guesses;
		var decoded = jwt.verify(token, secret());
		User.findOne({username: username}, function (err, user) {

			if (err) {
				console.log(err);
				return res.sendStatus(401);
			}
			if (user._id == decoded.id) {
				var partial_update = {$set: {guesses: guesses}};
				MiniGame.findOneAndUpdate({username: username}, partial_update, function (err) {
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
    app.post('/saveAbility', function (req, res) {
        var username = req.body.username;
        var token = req.body.token;
        var targets = req.body.targets;
        var salt = req.body.salt;
        var decoded = jwt.verify(token, secret());
        User.findOne({username: username}, function (err, user) {

            if (err) {
                console.log(err);
                return res.sendStatus(401);
            }
            if (user._id == decoded.id) {
                MiniGame.findOne({username: username}, function (err, minigameUser) {
                    if (err) {
                        console.log(err);
                        return res.sendStatus(401);
                    }
                    console.log("WAS TARGETTING: ")
                    console.log(targets);
                    console.log("JSOND: ")
                    var jsoned = JSON.stringify(targets)
                    console.log(jsoned);
                    var partial_update = {$set: {power_cur_target: encrypt(JSON.stringify(targets), minigameUser.original_salt)}};
                    MiniGame.findOneAndUpdate({username: username}, partial_update, function (err) {
                        if (err) {
                            console.log("ERRROR");
                            console.log(err);
                        } else {
                            res.sendStatus(212);
                        }
                    });
                });

            }
        });
    });

    app.post('/submitAbility', function (req, res) {
        var username = req.body.username;
        var token = req.body.token;
        var targets = req.body.targets;
        var salt = req.body.salt;
        var decoded = jwt.verify(token, secret());
        User.findOne({username: username}, function (err, user) {

            if (err) {
                console.log(err);
                return res.sendStatus(401);
            }
            if (user._id == decoded.id) {
                MiniGame.findOne({username: username}, function (err, minigameUser) {
                    if(decrypt(minigameUser.power_string, minigameUser.original_salt).indexOf("filler") == -1){
                        //used ability already bitch
                        return res.sendStatus(401);
                    }
                    if (err) {
                        console.log(err);
                        return res.sendStatus(401);
                    }
                    console.log("WAS TARGETTING: ")
                    console.log(targets);
                    console.log("JSOND: ")
                    var jsoned = JSON.stringify(targets)
                    console.log(jsoned);
                    var partial_update = {$set: {power_cur_target: encrypt(JSON.stringify(targets), minigameUser.original_salt)}};

                    //see what ability they had
                    var ability = decrypt(minigameUser.power, minigameUser.original_salt);
                    var info = ''
                    if(ability=="Onlooker"){
                        console.log("Onlooker TARGETS");
                        console.log(targets);
                        var original_roles = [];
                        shuffle(targets);
                        for(var i = 0; i < minigame_cached.length; i++){
                            if(targets.indexOf(minigame_cached[i]['username']) != -1 && original_roles.length != 3){
                                var original_salt =minigame_cached[i]['original_salt']
                                var original_name =minigame_cached[i]['original_role']['name']
                                original_roles.push(decrypt(original_name, original_salt))
                            }
                        }
                        info = "Between the 5 people you selected, 3 roles are: " + original_roles.join(",");
                    }else if(ability=="Eliminator"){
                        var original_roles = [];
                        var not1 = [];
                        var not2 = [];
                        var not3 = [];
                        for(var i = 0; i < minigame_cached.length; i++){
                            for(var j = 0; j < targets.length; j++){
                                if(minigame_cached[i]['username'] != targets[j]){
                                    var original_salt =minigame_cached[i]['original_salt']
                                    var original_name =minigame_cached[i]['original_role']['name']
                                    if(j == 0){
                                        not1.push(decrypt(original_name, original_salt))
                                    }else if(j==1){
                                        not2.push(decrypt(original_name, original_salt))
                                    }else{
                                        not3.push(decrypt(original_name, original_salt))
                                    }

                                }
                            }
                        }
                        shuffle(not1);
                        shuffle(not2);
                        shuffle(not3);

                        info = '';
                        for(var i = 0; i < targets.length; i++){
                            var cur_not;
                            if(i == 0){
                                cur_not = not1
                            }else if(i==1){
                                cur_not = not2
                            }else{
                                cur_not = not3
                            }
                            info += targets[i] + " is NOT " + cur_not[0] + ", " + cur_not[1]+ ", " + cur_not[2]+ ", " + cur_not[3] + " nor " + cur_not[4] + ". "
                        }

                    }else if(ability=="Repository"){
                        var games_playing = [];
                        shuffle(targets);
                        for(var i = 0; i < minigame_cached.length; i++){
                            if(targets.indexOf(minigame_cached[i]['username']) != -1 && games_playing.length != 3){
                                var original_salt =minigame_cached[i]['original_salt']
                                var original_game =minigame_cached[i]['original_role']['game']
                                games_playing.push(decrypt(original_game, original_salt))
                            }
                        }
                        info = "The 3 people you selected were playing: " + games_playing.join(",");
                    }else {
                        return res.send(401);
                    }
                        MiniGame.findOneAndUpdate({username: username}, partial_update, function (err) {
                        if (err) {
                            console.log("ERRROR");
                            console.log(err);
                        }
                    });
                    partial_update = {$set: {power_string: encrypt(info, minigameUser.original_salt)}};
                    MiniGame.findOneAndUpdate({username: username}, partial_update, function (err) {
                        if (err) {
                            console.log("ERRROR");
                            console.log(err);
                        } else {
                            return res.send(info);
                        }
                    });
                });

            }
        });
    });
	app.get('/getMiniGamePlayers.json', function (req, res) {
		var username = req.query.username;
		MiniGame.findOne({username: username}, function (err, user) {
			if (err) {
				console.log(err);
				return res.sendStatus(401);
			}

			User.find({"flags.said_yes_to_playing_minigame": true}, function(err, users) {
				if (err) {
					console.log(err);
					return res.sendStatus(401);
				}
				var users_list = [];

				users.forEach(function(user) {
					users_list.push(user.username);
				});

				return res.json(users_list);
			});
		});
	});

	app.post('/savebracket', function (req, res) {
		var username = req.body.username;
		var token = req.body.token;
		var bracket = req.body.bracket;
		var decoded = jwt.verify(token, secret());
		User.findOne({username: username}, function (err, user) {

			if (err) {
				console.log(err);
				return res.sendStatus(401);
			}
			if (user._id == decoded.id) {
				if(!settings['bracketOpened']){
					console.log("ITS CLOSED")
					return res.status(406).send("Not Acceptable - Brackets Closed. Please refresh.");
				}
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
    app.get('/achievements.json', function (req, res) {
        var username = req.query.username;
        User.findOne({username: username}, function (err, user) {
            if (err) {
                console.log(err);
                return res.sendStatus(404);
            }
            else {
                if (user == null) {
                    console.log(err);
                    return res.sendStatus(404);
                }
                //found user i guess...
                //probablty dont even need to do this
                var achievements = settings['achievements'];
                var usersAchievements = null;
                if(settings['achievementsByUser'] != null && username in settings['achievementsByUser']){
                    usersAchievements = settings['achievementsByUser'];
                }
                return res.json({'achievements': achievements, 'userAchievements': usersAchievements});

            }
        });
    });


	app.get('/savedBracket.json', function (req, res) {
		var username = req.query.username;
		User.findOne({username: username}, function (err, user) {
			if (err) {
				console.log(err);
				return res.sendStatus(404);
			}
			else {
                if (user == null) {
                    console.log(err);
                    return res.sendStatus(404);
                }
				var bracket = user.bracket;
				if (Object.keys(bracket).length == 0) {
					return res.status(404).send("No bracket found");
				} else {
					return res.json(bracket);
				}

			}
		});
	});

    app.get('/officialbracket.json', function (req, res) {
        var username = req.query.username;
        if(settings['bracketOpened']){
            return res.sendStatus(404);
        }
        User.findOne({username: username}, function (err, user) {
            if (err) {
                console.log(err);
                return res.sendStatus(404);
            }
            else {
                var bracket = settings['officialBracket'];
                if (Object.keys(bracket).length == 0) {
                    return res.status(404).send("No bracket found");
                } else {
                    return res.json(bracket);
                }

            }
        });
    });

    app.get('/everyonesbrackets.json', function (req, res) {
        var username = req.query.username;
        if(settings['bracketOpened']){
            return res.sendStatus(404);
        }
        User.findOne({username: username}, function (err, user) {
            if (err) {
                console.log(err);
                return res.sendStatus(404);
            }
            else {
                User.find({}, function(err, users) {
                    if (err) {
                        console.log(err);
                        return res.sendStatus(401);
                    }
                    var user_map = [];

                    users.forEach(function(user) {
                        user_map.push({'name': user.username, 'bracket': user.bracket});
                    });

                    if (user_map.length == 0) {
                        return res.status(404).send("No bracket found");
                    } else {
                        return res.json(user_map);
                    }
                });


            }
        });
    });

    app.get('/scoreboard.json', function (req, res) {
        var username = req.query.username;
        User.findOne({username: username}, function (err, user) {
            if (err) {
                console.log(err);
                return res.sendStatus(404);
            }
            else {
                var scoreboard = settings['scores'];
                if (Object.keys(scoreboard).length == 0) {
                    return res.status(404).send("No bracket found");
                } else {

                    return res.json(scoreboard);
                }

            }
        });
    });



    app.get('/moneyboard.json', function (req, res) {
        var username = req.query.username;
        User.findOne({username: username}, function (err, user) {
            if (err) {
                console.log(err);
                return res.sendStatus(404);
            }
            else {
                var moneyboard = settings['moneyBoard'];
                if (Object.keys(moneyboard).length == 0) {
                    return res.status(404).send("No bracket found");
                } else {

                    return res.json(moneyboard);
                }

            }
        });
    });

	app.get('/boxes_scoreboard.json', function (req, res) {
        if(settings['bracketOpened']){
            console.log("ITS STILL OPEN")
            return res.status(406).send("Not Acceptable - Brackets Still Opened. Please refresh.");
        }
		var username = req.query.username;
		User.findOne({username: username}, function (err, user) {
			if (err) {
				console.log(err);
				return res.sendStatus(404);
			}
			else {
				var boxes_scoreboard = settings['boxWinningsByUser'];
				if (Object.keys(boxes_scoreboard).length == 0) {
					return res.status(404).send("No bracket found");
				} else {

					return res.json(boxes_scoreboard);
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
		User.findOne({username: username}, function (err, user) {
			if (err) {
				console.log(err);
				return res.sendStatus(401);
			}
			if (user._id == decoded.id) {
				var new_flag = "flags." + flag;
				var new_set = {}
				new_set[new_flag] = val;
				var updated_flag = {$set: new_set};
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



	function generate_demo_numbers(username){
		var winning_numbers = [];
		var losing_numbers = [];

		for (var i = 0; i < 6; i++) {
			winning_numbers.push(shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));
			losing_numbers.push(shuffle([0, 9, 8, 7, 6, 5, 4, 3, 2, 1]));
		}

		var users = [username, "Lucia", "Nina", "Rupert", "Asher", "Finola", "Denver", "Faris", "Illtyd", "Mamie", "Olga", "Luiza"];
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
		return{
			winning_numbers: winning_numbers, losing_numbers: losing_numbers, users: players
		}
	}
	app.get('/boxes.json', function (req, res, next) {
		if(settings['bracketOpened']){
			var demo_numbers = generate_demo_numbers(req.query.username);
			var json = demo_numbers;
			res.json(json);
		}else{
			var json = {winning_numbers: settings['winning_numbers'], losing_numbers: settings['losing_numbers'], users: settings['player_numbers']};
			res.json(json);
		}

	});

    app.get('/didMiniGameStart.json', function (req, res) {
        return res.json({'started': settings['miniGameClosed']})
    })


	app.get('/brackets.json', function (req, res, next) {
		var json = tournament;
		res.json(json);
	});

	app.all('/*', function (req, res, next) {
        userPaid(req).then(function(data){
            console.log(data);
            if(data){
                var arbitraryUrls = ['partials'];
                if (arbitraryUrls.indexOf(req.url.split('/')[1]) > -1) {
                    next();
                } else {
                    res.render('index');
                }
            }else{
                res.render('payluke');
            }
        });

	});


	app.get('/partials/minigame', function (req, res) {
		if(settings['miniGameClosed']){
			if (req.session.token !== undefined) {
				var decoded = jwt.verify(req.session.token, secret());
				User.findOne({_id: decoded.id}, function (err, user) {
					if (err) {
						console.log(err);
						return res.sendStatus(401).send("COLDNT FIND");;
					}
					var username = user.username;
					MiniGame.findOne({username: username}, function (err, user) {
						if (err) {
							console.log(err);
							res.redirect('/');
						}

						if (user == undefined) {
							res.redirect('/');
						}

						res.render('partials/minigame');
					});
				});



			}else {
				console.log("NO SES")
					res.render('partials/minigame-signup');
				}


		}else {
			res.render('partials/minigame-signup');
		}
	});

    app.get('/partials/bracket-angular/:name', function (req, res, next) {
        var setting = "bracketOpened";
        if(settings[setting]){
            //brackets opened send to your page
            res.render('partials/bracket-angular', {opened: settings[setting]});

        }else{
            res.render('partials/bracket-angular', {opened: settings[setting], userToGet: "'" + req.params.name + "'"});
        }
    });
	app.get('/partials/bracket-angular', function (req, res, next) {
		var setting = "bracketOpened";
		res.render('.' + req.path, {opened: settings[setting]});
	});
	app.get('/partials/achievements/:name', function (req, res, next) {
		var setting = "bracketOpened";
		if(settings[setting]){
			//brackets opened send to your page
			res.render('partials/achievements', {opened: settings[setting]});

		}else{
			res.render('partials/achievements', {opened: settings[setting], userToGet: "'" + req.params.name + "'"});
		}
	});

    app.get('/partials/home', function (req, res, next) {
        var setting = "bracketOpened";
        res.render('.' + req.path, {opened: settings[setting]});

    });

	app.get('/partials/*', function (req, res, next) {
		console.log("WE RENDERING" + req.path);
		res.render('.' + req.path);
	});
};