angular.module('MiniGameController', []).controller('MiniGameController', ['$rootScope', '$scope', 'userInfoFactory', '$window', '$q', '$http', '$sce', function($rootScope, $scope, userInfoFactory, $window, $q, $http, $sce) {
	$scope.said_yes_to_playing_minigame = null;

	$scope.signup = function(agree){
		userInfoFactory.sendFlags($window.localStorage.token, $window.localStorage.user, 'said_yes_to_playing_minigame', agree);
		$scope.said_yes_to_playing_minigame = agree;
		if(!agree){
			$scope.playerSucks();
		}
	}

	$scope.getFlags = function(){
		if(!$window.localStorage.userFlags){
			userInfoFactory.getFlags($window.localStorage.token, $window.localStorage.user).then(function(data) {
				$scope.said_yes_to_playing_minigame = data.data.said_yes_to_playing_minigame;
				if(data.data.said_yes_to_playing_minigame == false){
					$scope.playerSucks();
				}
			});
		}
	};

	$scope.playerSucks = function(){
		$scope.slides = [];
		var gifs = ['http://rack.1.mshcdn.com/media/ZgkyMDEzLzA3LzE4L2VkL2NyeWluZ3NsaWRlLmFhMWRjLmdpZgpwCXRodW1iCTEyMDB4OTYwMD4/64829b30/e38/crying-slide.gif',
			'http://rack.2.mshcdn.com/media/ZgkyMDEzLzA3LzE4LzE3L1N1cGVybmF0dXJhLjYzM2JmLmdpZgpwCXRodW1iCTEyMDB4OTYwMD4/6735d712/ab4/Supernatural-Dean.gif',
			'http://rack.2.mshcdn.com/media/ZgkyMDEzLzA3LzE4LzJjL0xvdmVhbmRPdGhlLmE1NTQ2LmdpZgpwCXRodW1iCTEyMDB4OTYwMD4/0fef7083/ee2/Love-and-Other-Drugs.gif',
			'http://rack.3.mshcdn.com/media/ZgkyMDEzLzA3LzE4LzI3L01vbnN0ZXJzSW5jLmYxNjdiLmdpZgpwCXRodW1iCTEyMDB4OTYwMD4/79861af1/1ea/Monsters-Inc.gif',
			'http://rack.3.mshcdn.com/media/ZgkyMDEzLzA3LzE4Lzc1L0RyLldoby41Mjg5ZC5naWYKcAl0aHVtYgkxMjAweDk2MDA-/571ec44d/6da/Dr.-Who.gif'];
		for (var i=0; i<gifs.length; i++) {
			$scope.slides.push({
				image: gifs[i]
			});
		}
	}




	$scope.getFlags()








	/////////////////////////////// for the real
	$scope.showRole = false;
    $scope.showAbility = false;
    $scope.init = function(){
        $http({
            url: '/getMiniGameRole.json', method: "GET", params: {username: $window.localStorage.user}
        }).success(function(data) {
			$http({
				url: '/getMiniGamePlayers.json', method: "GET", params: {username: $window.localStorage.user}
			}).success(function(players) {
                $http({
                    url: '/getUsers.json', method: "GET"
                }).success(function(allUsers){
                    $scope.getScoreboard($window.localStorage.user).then(function (scoreboard) {




                        if (data.power_string.indexOf("filler") == -1) {
                            $scope.usedAbility = true;
                            $scope.abilityInfo = data.power_string;
                        }

                        if (data.curTargets) {
                            $scope.targets = data.curTargets;
                        } else {
                            $scope.targets = [];
                        }
                        $scope.allPlayers = allUsers;
                        console.log(allUsers)
                        $scope.me = $window.localStorage.user;
                        $scope.blues = [
                            {
                                scoring_img_1: "/img/minigame/redbluescoring1.PNG",
                                scoring_img_2: "/img/minigame/redbluescoring2.PNG",
                                img: '/img/president.png',
                                name: 'President',
                                win_condition: "You are the head of the blue team. If you win, the blue team wins. You win if you can score three points. See below. If the Bomber guesses you, both you and the blue team will lose.  In order to win, you must guess the Doctor, as well as either A) Guess the Bomber, or B) Be more than three ranks away from the Bomber at the end."
                            },
                            {
                                scoring_img_1: "/img/minigame/redbluescoring1.PNG",
                                scoring_img_2: "/img/minigame/redbluescoring2.PNG",
                                img: '/img/doctor.png',
                                name: 'Doctor',
                                win_condition: "You are the Doctor. You win if the President wins, and you guess the President."
                            },
                            {
                                scoring_img_1: "/img/minigame/redbluescoring1.PNG",
                                scoring_img_2: "/img/minigame/redbluescoring2.PNG",
                                img: '/img/one_armed_man.png',
                                name: 'One Armed Man',
                                win_condition: "You are the One Armed Man. You win if the President wins or you guess the Witness. You lose if the Fugitive guesses you, even if you guess the Witness or the President wins."
                            },
                            {
                                scoring_img_1: "/img/minigame/redbluescoring1.PNG",
                                scoring_img_2: "/img/minigame/redbluescoring2.PNG",
                                img: '/img/marshall.png',
                                name: 'Marshall',
                                win_condition: "You are the Marshall. You win if the President wins or you guess the Fugitive. You lose if the Witness guesses you, even if you guess the Fugitive or the President wins."
                            }
                        ]
                        $scope.reds = [
                            {
                                scoring_img_1: "/img/minigame/redbluescoring1.PNG",
                                scoring_img_2: "/img/minigame/redbluescoring2.PNG",
                                img: '/img/bomber.png',
                                name: 'Bomber',
                                win_condition: "You are the head of the red team. If you win, the red team wins. You win if you can score three points. See below. If the president guesses you, both you and the red team will lose.  In order to win, you must guess the Engineer, as well as either A) Guess the President, or B) Be three ranks or fewer away from the President at the end."
                            },
                            {
                                scoring_img_1: "/img/minigame/redbluescoring1.PNG",
                                scoring_img_2: "/img/minigame/redbluescoring2.PNG",
                                img: '/img/engineer.png',
                                name: 'Engineer',
                                win_condition: "You are the Engineer. You win if the Bomber wins, and you guess the Bomber."
                            },
                            {
                                scoring_img_1: "/img/minigame/redbluescoring1.PNG",
                                scoring_img_2: "/img/minigame/redbluescoring2.PNG",
                                img: '/img/fugitive.png',
                                name: 'Fugitive',
                                win_condition: "You are the Fugitive. You win if the Bomber wins or you guess the One Armed Man. You lose if the Marshall guesses you, even if you guess the One Armed Man or the Bomber wins."
                            },
                            {
                                scoring_img_1: "/img/minigame/redbluescoring1.PNG",
                                scoring_img_2: "/img/minigame/redbluescoring2.PNG",
                                img: '/img/witness.png',
                                name: 'Witness',
                                win_condition: "You are the Witness. You win if the Bomber wins or you guess the Marshall. You lose if the One Armed Man guesses you, even if you guess the Marshall or the Bomber wins."
                            }
                        ]

                        $scope.werewolves = [
                            {
                                scoring_img_1: "/img/minigame/werewolfscoring1.PNG",
                                scoring_img_2: "/img/minigame/werewolfscoring2.PNG",
                                img: '/img/werewolf1.png',
                                name: 'Werewolf1',
                                win_condition: "You are Werewolf 1. You win if the Werewolves win. The Werewolves win if they can score three points. If they cannot, the Werewolves lose. See the bottom graphic for how they can score points."
                            },
                            {
                                scoring_img_1: "/img/minigame/werewolfscoring1.PNG",
                                scoring_img_2: "/img/minigame/werewolfscoring2.PNG",
                                img: '/img/werewolf2.png',
                                name: 'Werewolf2',
                                win_condition: "You are Werewolf 2. You win if the Werewolves wins. The Werewolves win if they can score three points. If they cannot, the Werewolves lose. See the bottom graphic for how they can score points."
                            },
                            {
                                scoring_img_1: "/img/minigame/werewolfscoring1.PNG",
                                scoring_img_2: "/img/minigame/werewolfscoring2.PNG",
                                img: '/img/minion.png',
                                name: 'Minion',
                                win_condition: "You are the Minion. You win if the Werewolves win. The Werewolves win if they can score three points. If they cannot, the Werewolves lose. See the bottom graphic for how they can score points."
                            },
                        ]
                        $scope.village = [
                            {
                                scoring_img_1: "/img/minigame/werewolfscoring1.PNG",
                                scoring_img_2: "/img/minigame/werewolfscoring2.PNG",
                                img: '/img/seer.png',
                                name: 'Seer',
                                win_condition: "You are the Seer. You win if the Village wins. The Village wins if they can score three points. If they cannot, the Village loses. See the bottom graphic for how they can score points."
                            },
                            {
                                scoring_img_1: "/img/minigame/werewolfscoring1.PNG",
                                scoring_img_2: "/img/minigame/werewolfscoring2.PNG",
                                img: '/img/robber.png',
                                name: 'Robber',
                                win_condition: "You are the Robber. You win if the Village wins. The Village wins if they can score three points. If they cannot, the Village loses. See the bottom graphic for how they can score points."
                            },
                            {
                                scoring_img_1: "/img/minigame/werewolfscoring1.PNG",
                                scoring_img_2: "/img/minigame/werewolfscoring2.PNG",
                                img: '/img/troublemaker.png',
                                name: 'Troublemaker',
                                win_condition: "You are the Troublemaker. You win if the Village wins. The Village wins if they can score three points. If they cannot, the Village loses. See the bottom graphic for how they can score points."
                            },
                        ]

                        $scope.allRoles = [];
                        for (var i = 0; i < $scope.blues.length; i++) {
                            $scope.allRoles.push($scope.blues[i])
                        }
                        for (var i = 0; i < $scope.reds.length; i++) {
                            $scope.allRoles.push($scope.reds[i])
                        }
                        for (var i = 0; i < $scope.werewolves.length; i++) {
                            $scope.allRoles.push($scope.werewolves[i])
                        }
                        for (var i = 0; i < $scope.village.length; i++) {
                            $scope.allRoles.push($scope.village[i])
                        }

                        $scope.players = players;
                        $scope.myRoleName = data.role.name;

                        $scope.abilityList = [{name: 'Silence', desc: 'Disable someone\'s power. If they had Onlooker, Eliminator, or Repository, nothing happens.', priority: 1},
                            {
                                name: 'Sentinel',
                                desc: 'Choose another player besides yourself - that player cant be moved',
                                priority: 2
                            },
                            {
                                name: 'Clone',
                                desc: 'Choose a player; any time that player is targeted, you are targeted instead, and vice versa',
                                priority: 3
                            },
                            {
                                name: 'Gravity',
                                desc: 'Choose someone besides yourself; if they are ahead of you, they lose 1/3 the difference, If they are behind you, they gain 1/3 the difference',
                                priority: 4
                            },
                            {
                                name: 'Swapper',
                                desc: 'Choose a player, that player will swap points with the person ahead of them (can be yourself)',
                                priority: 5
                            },
                            {
                                name: 'Push',
                                desc: 'Everyone <10 pts ahead of you gets 10 pts, everyone <10 pts behind you loses 10 pts',
                                priority: 6
                            },
                            {
                                name: 'Union',
                                desc: 'Everyone 10-20 pts ahead of you loses 10 pts; if less than 3 ppl then the 3 ppl ahead of you lose 6/11/16 points',
                                priority: 7
                            },
                            {
                                name: 'Mirror',
                                desc: 'Choose another player - if you gained points they lose that many points and vice versa',
                                priority: 8
                            },
                            {
                                name: 'Jumper',
                                desc: 'If you lost any points, you gain double what you lost',
                                priority: 9
                            },
                            {
                                name: 'Together',
                                desc: 'Choose a player besides yourself - if they gained or lost any points, you gain or lose those points as well, and vice versa.',
                                priority: 10
                            },
                            {
                                name: 'Resetter',
                                desc: 'Choose another player; that player\'s points get reset to what they were before, if they would have at least as many points as you have',
                                priority: 11
                            },
                            {
                                name: 'Onlooker',
                                desc: 'Choose 5 players. Will tell you 3 original roles of the 5.',
                                priority: 'N/A'
                            },
                            {
                                name: 'Eliminator',
                                desc: 'Choose 3 players. Will tell you who they are not originally (5 eliminations per player).',
                                priority: 'N/A'
                            },
                            {
                                name: 'Repository',
                                desc: 'Choose 3 players. Will tell you which games they are playing originally (but not who is playing which game)',
                                priority: 'N/A'
                            }]
                        $scope.myAbility = "You have been given one random ability. It is " + data.abilities + ". ";
                        for (var i = 0; i < $scope.abilityList.length; i++) {
                            if ($scope.abilityList[i].name == data.abilities) {
                                $scope.myAbility += $scope.abilityList[i].desc;
                            }
                        }
                        //See below for its effect.";
                        var cannotTargetSelf = ["Silence", "Sentinel", "Clone", "Gravity", "Mirror", "Resetter", "Together"]
                        var noTargets = ["Push", "Union", "Jumper"]
                        $scope.onlyTargetInactives = false;
                        $scope.onlyTargetPlayers = false;
                        $scope.seekerPower = false;
                        $scope.cannotTargetSelf = false;
                        if (data.abilities == "Repository") {
                            $scope.cannotTargetSelf = true;
                            $scope.seekerPower = true;
                            $scope.onlyTargetPlayers = true;
                            $scope.possibleSelections = 3;
                        } else if (data.abilities == "Eliminator") {
                            $scope.cannotTargetSelf = true;
                            $scope.seekerPower = true;
                            $scope.onlyTargetPlayers = true;
                            $scope.possibleSelections = 3;
                        } else if (data.abilities == "Onlooker") {
                            $scope.cannotTargetSelf = true;
                            $scope.seekerPower = true;
                            $scope.onlyTargetPlayers = true;
                            $scope.possibleSelections = 5;
                        } else if (cannotTargetSelf.indexOf(data.abilities) > -1) {
                            $scope.cannotTargetSelf = true
                            $scope.possibleSelections = 1;
                        } else if (noTargets.indexOf(data.abilities) > -1) {
                            $scope.possibleSelections = 0;
                        } else {
                            $scope.possibleSelections = 1;
                        }


                        $scope.users_for_select = [{'name': 'None'}];


                        console.log(data);
                        $scope.guessed_players = {};
                        $scope.guessed_roles = {};
                        for (var i = 0; i < $scope.allRoles.length; i++) {
                            console.log("MAKING NONE 3")
                            $scope.guessed_roles[$scope.allRoles[i].name] = "None";
                        }
                        for (var i = 0; i < $scope.players.length; i++) {
                            console.log("MAKING NONE 4")
                            $scope.users_for_select.push({'name': $scope.players[i]})
                            $scope.guessed_players[$scope.players[i]] = "None";
                        }
                        $scope.targetted_player = {
                            'target': $scope.users_for_select[0]
                        };

                        $scope.toggleTargetted = function (name) {
                            var selection = $scope.targets;
                            var idx = selection.indexOf(name);

                            // is currently selected
                            if (idx > -1) {
                                selection.splice(idx, 1);
                            }

                            // is newly selected
                            else {
                                selection.push(name);
                            }

                            console.log($scope.targets)
                        };


                        for (var i = 0; i < $scope.players.length; i++) {
                            $scope.$watch('guessed_players["' + $scope.players[i] + '"]', function (newValue, oldValue) {
                                if (oldValue && oldValue != '' && newValue !== "None" && oldValue != newValue) {
                                    console.log("CHANGED FROM " + oldValue + " TO " + newValue)
                                    $scope.guessed_roles[oldValue] = null
                                    $scope.guessed_roles[oldValue] = "None"
                                }
                            });
                        }

                        for (var i = 0; i < $scope.allRoles.length; i++) {
                            $scope.$watch('guessed_roles["' + $scope.allRoles[i].name + '"]', function (newValue, oldValue) {
                                if (oldValue && oldValue != '' && newValue !== "None" && oldValue != newValue) {
                                    $scope.guessed_players[oldValue] = null
                                    $scope.guessed_players[oldValue] = "None"
                                }
                            });
                        }
                        if (data.actions_did.indexOf("robbed") > -1) {
                            $scope.roleinfo = "You WERE the robber. " + data.actions_did;
                        } else if (data.actions_did.indexOf("filler") > -1) {
                            $scope.roleinfo = "You are the " + data.role.name + "."
                        } else {
                            $scope.roleinfo = "You are the " + data.role.name + ". " + data.actions_did;
                        }
                        $scope.roleinfo += " Your team is " + data.role.team + " and you are from the game " + data.role.game + ". Please check the index to see how you win.";

                        $scope.saveAbility = function () {
                            $scope.postSaveAbility($window.localStorage.user, $window.localStorage.token, $scope.targets).success(function () {
                                alert("SAVED");
                            }).error(function (status, data) {
                                console.log("SOERROR");
                                alert(status);
                                console.log(status);
                                console.log(data);
                            });
                        };

                        $scope.postSaveAbility = function (username, token, targets) {
                            return $http.post('/saveAbility', {username: username, token: token, targets: targets});
                        }

                        $scope.submitAbility = function () {
                            if($scope.targets.length == $scope.possibleSelections){
                                $scope.postSubmitAbility($window.localStorage.user, $window.localStorage.token, $scope.targets).success(function (data) {
                                    alert("SAVED");
                                    console.log(data);
                                    $scope.usedAbility = true;
                                    $scope.abilityInfo = data;
                                }).error(function (status, data) {
                                    console.log("SOERROR");
                                    alert(status);
                                    console.log(status);
                                    console.log(data);
                                });
                            }

                        };

                        $scope.postSubmitAbility = function (username, token, targets) {
                            return $http.post('/submitAbility', {username: username, token: token, targets: targets});
                        }

                        $scope.guessedClass = function (name) {
                            var c = ''
                            var found_color = false;
                            for (var i = 0; i < $scope.blues.length; i++) {
                                if ($scope.blues[i]['name'] == name) {
                                    c = 'blue-team'
                                    found_color = true;
                                    break;
                                }
                            }
                            if (!found_color) {
                                for (var i = 0; i < $scope.reds.length; i++) {
                                    if ($scope.reds[i]['name'] == name) {
                                        c = 'red-team'
                                        found_color = true;
                                        break;
                                    }
                                }
                            }
                            if (!found_color) {
                                for (var i = 0; i < $scope.village.length; i++) {
                                    if ($scope.village[i]['name'] == name) {
                                        c = 'village-team'
                                        found_color = true;
                                        break;
                                    }
                                }
                            }
                            if (!found_color) {
                                for (var i = 0; i < $scope.werewolves.length; i++) {
                                    if ($scope.werewolves[i]['name'] == name) {
                                        c = 'werewolf-team'
                                        found_color = true;
                                        break;
                                    }
                                }
                            }
                            return c
                        }




                        var sort_by = function() {
                            var fields = [].slice.call(arguments),
                                n_fields = fields.length;

                            return function(A, B) {
                                var a, b, field, key, primer, reverse, result;
                                for (var i = 0, l = n_fields; i < l; i++) {
                                    result = 0;
                                    field = fields[i];

                                    key = typeof field === 'string' ? field : field.name;

                                    a = A[key];
                                    b = B[key];

                                    if (typeof field.primer !== 'undefined') {
                                        a = field.primer(a);
                                        b = field.primer(b);
                                    }

                                    reverse = (field.reverse) ? -1 : 1;

                                    if (a < b) result = reverse * -1;
                                    if (a > b) result = reverse * 1;
                                    if (result !== 0) break;
                                }
                                return result;
                            }
                        }



                        var sortable = [];
                        $scope.miniGameScoreboard = []
                        for (var user in scoreboard){
                            $scope.miniGameScoreboard.push({name: user, score: scoreboard[user]['Total Score'], achievements: scoreboard[user]["Achievements"], 'minigame_ability_adjustments': 0, 'final_score': scoreboard[user]['Total Score']})
                        }
                        $scope.miniGameScoreboard.sort(sort_by({name: "score", reverse: true},{name: "achievements", reverse: true}))
                        var last_score = -1;
                        var last_rank = -1;
                        var last_achievements = -1;
                        for (var i = 0; i < $scope.miniGameScoreboard.length; i++) {
                            var score = $scope.miniGameScoreboard[i]['score']
                            var achievements = $scope.miniGameScoreboard[i]['achievements']
                            var rank = last_score == score && achievements == last_achievements ? last_rank : i + 1;
                            last_score = score;
                            last_achievements = achievements;
                            last_rank = rank;
                            $scope.miniGameScoreboard[i]['rank'] = rank;
                        }


                        //copy the references (you could clone ie angular.copy but then have to go through a dirty checking for the matches)
                        $scope.displayedCollection = [].concat($scope.miniGameScoreboard);
                        console.log($scope.miniGameScoreboard)

                        $scope.notPlaying = function(name){
                            return $scope.players.indexOf(name) == -1
                        }
                        $scope.startJoyRide = false;

                        $scope.showTutorial = function(){
                            $scope.startJoyRide = true;

                        }
                        $scope.onFinish = function(){
                            $scope.startJoyRide = false;
                        }
                    });
                }).error(function(){

                });
			});

		});
    }
    $scope.config = [
        {
            type: "title",
            heading: "Welcome to the March Madness Madness Minigame!",
            text: 'This minigame is a battle of wits and guts. The path to victory is by defeating your arch enemy. You can defeat your archenemy in two ways:'
        },
        {
            type: "element",
            selector: ".scoreboard-section",
            heading: "Defeating your enemy 1",
            text: "Utterly humiliating them in the scoreboard by scoring more points...,",
            placement: "top",
            scrollPadding: 250,
            scroll: true
        },
        {
            type: "element",
            selector: ".guess-section",
            heading: "Defeating your enemy 2",
            text: "Or showing your superior intellect by correctly guessing who they are. (note: also most guesses wins money so maybe you want that too).",
            placement: "top",
            scrollPadding: 250,
            scroll: true
        },
        {
            type: "element",
            selector: ".your-char-section",
            heading: "Wait What?",
            text: "So how do you know who you are? It said so in your email. Or, click the button here to find out.",
            placement: "top",
            scrollPadding: 250,
            scroll: true
        },
        {
            type: "element",
            selector: ".all-chars-section",
            heading: "Wait What?",
            text: "This part will tell you the actual way you defeat your enemy. (Ask Luke for questions but Luke is also playing, so he doesn't know who you are unless you tell him...but then he will guess who you are this is a warning)",
            placement: "top",
            scrollPadding: 350,
            scroll: true
        },
        {
            type: "element",
            selector: ".your-ability",
            heading: "But..",
            text: "What if you are someone like Jane (who isn't playing so we can use her as an example) and are stuck at the bottom? Well, you were given a special ability as well. Click this button to see what it is again.",
            placement: "top",
            scrollPadding: 350,
            scroll: true
        },
        {
            type: "element",
            selector: ".all-abilities",
            heading: "All Abilities",
            text: "All the abilities are listed here.  Note, you MUST SELECT YOUR TARGET before the end of the tournament for it to have an effect. Luke will warn you of this. Your ability only works when the tournament is over. ",
            placement: "top",
            scrollPadding: 350,
            scroll: true
        },
        {
            type: "element",
            selector: ".all-abilities-2",
            heading: "All Abilities",
            text: "There is a priority to the order in which the abilities goes, and that is what the priority means. If your ability is 'Onlooker', 'Eliminator' or 'Repository', then you can use your ability whenever before the tournament is over (These are info gathering roles, in case you didn't get that.) WHEN THE TOURNAMENT IS OVER WHOEVER YOU WILL AUTOMATICALLY USE YOUR ABILITY ON WHOMEVER YOU HAVE SELECTED!!",
            placement: "top",
            scrollPadding: 450,
            scroll: true
        },
        {
            type: "element",
            selector: ".all-abilities",
            heading: "All Abilities",
            text: "TO REPEAT: WHEN THE TOURNAMENT IS OVER WHOEVER YOU WILL AUTOMATICALLY USE YOUR ABILITY ON WHOMEVER YOU HAVE SELECTED!! You can select someone whenever you want. If your ability does not have a selection, then ignore this.",
            placement: "top",
            scrollPadding: 350,
            scroll: true
        },
        {
            type: "element",
            selector: ".scoreboard-section",
            heading: "The Final Score",
            text: "Your abilities MAY affect the position rankings. This is independent of the actual scoreboard, but it is your minigame scoreboard ranking that determines whether you win or lose.",
            placement: "top",
            scrollPadding: 350,
            scroll: true
        },
        {
            type: "element",
            selector: ".guess-section",
            heading: "Vengeance",
            text: "REMEMBER!!!! MOST CORRECT GUESSES WIN MONEY!! Also, if you can't win, if you can guess your arch enemy right, you will cause them to lose as well.",
            placement: "top",
            scrollPadding: 350,
            scroll: true
        },
        {
            type: "element",
            selector: ".guess-section-2",
            heading: "Knowledge",
            text: "So how to know who is who? Do whatever you want, guess, ask people, offer to trade info, get them drunk, whatever, just don't do anything illegal.",
            placement: "right",
            scrollPadding: 250,
            scroll: true
        },
        {
            type: "element",
            selector: ".all-chars-section",
            heading: "Wait What?",
            text: "Review the characters before you guess. (This is just to make you scroll back top)",
            placement: "top",
            scrollPadding: 350,
            scroll: true
        },
        {
            type: "title",
            heading: "End!",
            text: "The end! Have fun."
        }
    ];



    $scope.winDescription = "";
    $scope.show_conditions = false;

    $scope.showDescription = function(p){
        $scope.winDescription = p.win_condition;
        $scope.selected = p;
    }
	$scope.selected = null;



	$scope.guess = function(p, r, oldp, oldr){
		$scope.guessed_roles[r] = p;
		$scope.guessed_players[p] = r;
        console.log($scope.guessed_players[p])

	}
    $scope.getScoreboard = function(username) {
        var deferred = $q.defer();
        $http({
            url: '/scoreboard.json', method: "GET", params: {username: username}
        }).success(function(data){
            deferred.resolve(data);
        }).error(function(){

            deferred.reject("No official bracket yet.")
        });

        return deferred.promise;
    };



	$scope.alreadyGuessed = function(p, r){
		if(p){
			return (p in $scope.guessed_players && $scope.guessed_players[p] != null && $scope.guessed_players[p] != "None");
		}
		if(r){
			return (r in $scope.guessed_roles && $scope.guessed_roles[r] != null && $scope.guessed_roles[r] != "None");
		}
	}
	$scope.saveChanges = function () {
		var new_bracket = {"roles" : $scope.guessed_roles, "players": $scope.guessed_players};
		$scope.saveGuesses($window.localStorage.token, $window.localStorage.user, new_bracket).success(function () {
			alert("SAVED");
		}).error(function (status, data) {
			console.log("SOERROR");
			alert(status);
			console.log(status);
			console.log(data);
		});
	};

	$scope.submitGuesses = function(){
		return $http.post( '/saveGuesses', {username: username, token: token, guesses: guesses});
	}

    $http({
        url: '/didMiniGameStart.json', method: "GET"
    }).success(function(data) {
        if(data['started']){
            $scope.init();
        }
    });




}]);