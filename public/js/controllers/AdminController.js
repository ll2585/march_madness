angular.module('AdminController',  []).controller('AdminController', ['$scope',  '$window','$rootScope', '$http', '$alert', function($scope, $window, $rootScope, $http, $alert) {
	$scope.Math = window.Math;
    $scope.hi = "HI LUKE YOU ARE THE BEST"

    $scope.championship_map = {
        "mid_west": 4,
        "west": 5,
        "east": 6,
        "south": 7
    };
    $scope.init = function(){
		$http.get('/admin/getAllSettings').success(function(data){
			$scope.settings = data;
			console.log("SETTINGS!!")
			console.log(data);
			$scope.brackets_opened = data['bracketOpened']
			$scope.officialBracket = data['officialBracket']
            $scope.moneyBoard = data['moneyBoard'];
            $scope.achievements = data['achievements'];
            $scope.achievementsByUser = data['achievementsByUser'];
			$scope.boxWinningsByUser = data['boxWinningsByUser'];
			$scope.numbers_generated = data['winning_numbers'] !== null;
			$scope.winning_numbers = data['winning_numbers'];
			$scope.losing_numbers = data['losing_numbers'];
			$scope.player_numbers = data['player_numbers'];
			console.log("were the numbers generated?")
			console.log(data['winning_numbers'])
			console.log($scope.numbers_generated)
            if($scope.achievementsByUser==null){
                $scope.achievementsByUser = {};
            }
			if($scope.boxWinningsByUser==null){
				$scope.boxWinningsByUser = {};
			}
            console.log($scope.achievements);
            $scope.toggleMultiple = function(i) {
                $scope.moneyBoard[i]['player'] = $scope.moneyBoard[i]['player'].slice(0,1)
            };
			$scope.generateNumbers = function(){
				if($scope.numbers_generated){
					if(!confirm("Are you sure? They have been generated already!")){
						return;
					}
				}

				var user_usernames = [];
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
				for(var u in $scope.users){
					user_usernames.push($scope.users[u].username);
				}
				var winning_numbers = [];
				var losing_numbers = [];

				for (var i = 0; i < 6; i++) {
					winning_numbers.push(shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));
					losing_numbers.push(shuffle([0, 9, 8, 7, 6, 5, 4, 3, 2, 1]));
				}

				var boxes = [];
				while (boxes.length < 100) {
					if (100 - boxes.length < user_usernames.length) { //not even so fill with no one
						boxes.push("None");
					} else {
						for (var j = 0; j < user_usernames.length; j++) {
							boxes.push(user_usernames[j]);
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
				$scope.losing_numbers = losing_numbers
				$scope.winning_numbers = winning_numbers
				$scope.player_numbers = players;
				$scope.numbers_generated = true;
			}
            $scope.toggleSelection = function(name, i) {
                var selection = $scope.getMultipleLeaderSelection(i);
                var idx = selection.indexOf(name);

                // is currently selected
                if (idx > -1) {
                    selection.splice(idx, 1);
                }

                // is newly selected
                else {
                    selection.push(name);
                }
            };

            $scope.getMultipleLeaderSelection = function(i) {
                var selection = $scope.moneyBoard[i]['player'];
               return selection;
            };

			$scope.region = 'mid_west';
            $scope.calculateScore = function(region, team_id){
                if(region == "championship"){
                    var round = $scope.getRound(team_id)
                    if(round > 2) {
                        return 0;
                    }else{
                        return(Math.pow(2,5-round))
                    }
                }else{
                    var round = $scope.getRound(team_id)
                    if(round > 3) {
                        return 0;
                    }else{
                        return(Math.pow(2,3-round))
                    }
                }
            }
            $scope.getRound = function(team_id){
                return Math.floor(Math.log(team_id)/Math.log(2));
            }
            $scope.determineScore = function(bracket){
                var totalScore = 0;
                var roundScore = {
                    "Round of 64": 0,
                    "Round of 32": 0,
                    "Round of 16": 0,
                    "Elite Eight": 0,
                    "Final Four": 0,
                    "National Championship Game": 0
                };
                var official = $scope.officialBracket;
                var totalPicks = 0;
                var roundPicks = {
                    "Round of 64": 0,
                    "Round of 32": 0,
                    "Round of 16": 0,
                    "Elite Eight": 0,
                    "Final Four": 0,
                    "National Championship Game": 0
                };
                var users = bracket;
				console.log(bracket)
				if(bracket !== undefined){
					for(var region in official){
						for(var team_id in official[region]['tree']){
							var node = official[region]['tree'][team_id];
							if(node.team !== null){
								if(node.team.name == users[region]['tree'][team_id]['team']['name']){
									var regionName = $scope.getRegionNameForTeamID(region, team_id);
									if(regionName != null){ //so ignore championship first round and first row of regions
										totalPicks += 1;
										var pointsForThisPick = $scope.calculateScore(region, team_id);
										totalScore += pointsForThisPick;

										roundScore[regionName] += pointsForThisPick;
										roundPicks[regionName] +=1;
									}

								}
							}

						}
					}
				};
                var score = {
                    "Total Score": totalScore,
                    "Total Picks": totalPicks,
                    "Round Score": roundScore,
                    "Round Picks": roundPicks
                };


                return score;
            }
            $scope.calculateMoneyBoard = function(username, bracket){
                var totalScore = 0;
                var user_info = {};
                for(var i = 0; i < $scope.moneyBoard.length; i++){
                    user_info[$scope.moneyBoard[i]['category']] = 0;
                }
                user_info["First Place"] = {value: $scope.scoreboard[username]["Total Score"]}
                user_info["Closest To 50 Points"] = {value: 1000-Math.abs(50-$scope.scoreboard[username]["Total Score"]), info:"Has " + $scope.scoreboard[username]["Total Score"] + "" +
				" points for a difference of " + Math.abs(50-$scope.scoreboard[username]["Total Score"])};

                user_info["Worst Pick"] = {value: 0, info: ''};
                var users = bracket;
				if(bracket === undefined){ return user_info; }
                var official = $scope.officialBracket;
                var heartbreaking_count = 0;
                var round_one_upsets = 0;
                var blues_chosen = 0;
                var reds_chosen = 0;
                for(var region in official){
                    for(var team_id in official[region]['tree']){
                        var node = official[region]['tree'][team_id];

                        if(node.team !== null && node.left !== null){
                            var winning_team = node.team.name;
                            var this_team_color = node.team.color;
                            var left_score = official[region]['tree'][node.left]['score'];
                            var left_team = official[region]['tree'][node.left]['team'];
                            var left_team_color = official[region]['tree'][node.left]['team']['color']
                            var right_team = official[region]['tree'][node.right]['team'];
                            var right_team_color = official[region]['tree'][node.right]['team']['color']
                            var left_team_name = official[region]['tree'][node.left]['team']['name'];
                            var right_team_name = official[region]['tree'][node.right]['team']['name'];
                            var chosen_team_name = users[region]['tree'][team_id]['team']['name'];
                            var right_score = official[region]['tree'][node.right]['score'];
                            var left_seed =official[region]['tree'][node.left]['team']['seed'];
                            var right_seed =official[region]['tree'][node.right]['team']['seed'];
                            var chosen_seed = users[region]['tree'][team_id]['team']['seed'];
                            var your_left_team = users[region]['tree'][node.left]['team'];
                            var your_right_team = users[region]['tree'][node.right]['team'];
                            //do the worst loss first
                            if(node.team.name != users[region]['tree'][team_id]['team']['name']){ //you don't have the right pick
                                if($scope.rightTeamsInMatchup(region, node, bracket)){
                                    if(users[region]['tree'][team_id]['team']['seed'] < node.team.seed){
                                        heartbreaking_count += 1;
                                    }
                                    var difference = Math.abs(left_score - right_score);
                                    if(difference > user_info["Worst Pick"]['value']){
                                        user_info["Worst Pick"]['value'] = difference;
                                        user_info["Worst Pick"]['info'] = left_team_name + " v. " + right_team_name + ": " + name + " chose " + chosen_team_name + " to win but they lost by a score of " + left_score + " to " + right_score + ", for a difference of " + difference
                                    }
                                }

                            }else{
                                //correct team chosen, not first round

                                ////upsets in round 1
                                var round = $scope.getRound(team_id)
                                if(node.team.color == 'blue'){
                                    blues_chosen += 1;
                                }
                                if($scope.rightTeamsInMatchup(region, node, bracket)) {
                                    if (round == 3 && region != 'championship') {
                                        if (chosen_seed == Math.max(left_seed, right_seed)) {
                                            round_one_upsets += 1;
                                        }
                                    }
                                }
                            }

                            //if left is red and your left is red and this isnt left and your this isnt that, or with right, then get a red point
                            if((left_team_color == 'red' && left_team_name==your_left_team.name && winning_team!= left_team_name) ||
                                (right_team_color == 'red' && right_team_name==your_right_team.name && winning_team!= right_team_name)){
                                reds_chosen += 1;
                            }
                        }

                    }
                }
                user_info["Most Heartbreaking"] = {value: heartbreaking_count, info: ''};
                user_info["Most Correct Upsets in Round 1"] = {value: round_one_upsets, info: ''};
                user_info["Most Correct Blue Teams"] = {value: blues_chosen, info: ''};
                user_info["Most Correct Red Teams"] = {value: reds_chosen, info: ''};
                console.log(-Math.abs(50-$scope.scoreboard[username]["Total Score"]))
                return user_info
            }



            $scope.calculateUserAchievements = function(intial_arr, username, bracket){

                //IGNORE ONES THAT ARE ALREADY OWNED
                var achievements = intial_arr;
                var achievement_dict = {};
                for(var i = 0; i < achievements.length; i++){
                    achievement_dict[achievements[i]['achievement']] = i
                }
                function giveAchievement(achievement){
                    achievements[achievement_dict[achievement]]['owned'] = true;
                }
				if(bracket === undefined){ return achievements; }

                var completed_picks = 0;

                var users = bracket;
                var official = $scope.officialBracket;
                var dog_count = 0;
                var cat_count = 0;
                var correct_picks = 0;
                var billionaire_ids = ["mid_west_13", "south_13", "west_13", "west_15", "mid_west_12", "south_12", "west_12", "west_14", "east_8", "mid_west_9", "west_11", "south_10"];
                var billionaire_picks = 0;
                var two_for_two = 0;
                var first_round_picks = 0;
                var tough_luck = 0;
                var payback_count = 0;
                var merlin_teams = 0;
                var reverser_choices = 0;
                var percival_teams = 0;
                var oberon_reds_defeated = [];
                var oberon_blues_defeated = [];
                var lady_blue_rounds = [false, false, false, false, false];
                var lady_red_rounds = [false, false, false, false, false];
                if(official['championship']['tree'][2]['team'] !== null && official['championship']['tree'][3]['team'] !== null){
                    if(official['championship']['tree'][2]['team']['name'] ==  users['championship']['tree'][2]['team']['name']&&
                        official['championship']['tree'][3]['team']['name'] ==  users['championship']['tree'][3]['team']['name']){
                        giveAchievement("You love the game");
                    }
                    if(official['championship']['tree'][2]['team']['name'] !=  users['championship']['tree'][2]['team']['name']&&
                        official['championship']['tree'][3]['team']['name'] !=  users['championship']['tree'][3]['team']['name']){
                        for(var i = 4; i < 8; i++){
                            if(official['championship']['tree'][i]['team']['name'] ==  users['championship']['tree'][i]['team']['name']){
                                giveAchievement("I'm on the bleachers");
                            }
                        }
                    }
                }

                for(var region in official){
                    if(region != 'championship'){
                        if(official[region]['tree'][2]['team'] !== null && official[region]['tree'][3]['team'] !== null) {
                            if (users[region]['tree'][2]['team']['name'] !== official[region]['tree'][2]['team']['name'] &&
                                users[region]['tree'][3]['team']['name'] !== official[region]['tree'][3]['team']['name']) {
                                giveAchievement("Blackout");
                            }
                        }
                        var allTheresLeftCounter = 0;
                        for(var i = 8; i < 16; i++){
                            if(official[region]['tree'][i]['team'] !== null) {
                                if (users[region]['tree'][i]['team']['name'] == official[region]['tree'][i]['team']['name']){
                                    allTheresLeftCounter += 1;
                                }

                            }
                        }
                        if(allTheresLeftCounter == 8){
                            giveAchievement("All there's left to do is run");
                        }
                    }
                    if(region == 'championship'){
                        for(var i = 4; i < 8; i++){
                            if(official[region]['tree'][i]['team'] !== null){
                                if(official[region]['tree'][i]['team']['name'] ==  users[region]['tree'][i]['team']['name']){

                                    merlin_teams += 1;
                                   if(official[region]['tree'][i]['team']['name'] == users[region]['tree'][1]['team']['name']) {
                                       var possible_hope = true;
                                       for(var j = 4; j < 8; j++){
                                           if(j != i && official[region]['tree'][j]['team'] != null){
                                               possible_hope = possible_hope && (official[region]['tree'][j]['team']['name'] !=  users[region]['tree'][j]['team']['name'])
                                           }
                                       }
                                       if(possible_hope){
                                           giveAchievement("A New Hope")
                                       }

                                    }
                                }
                            }
                        }
                    }
                    for(var team_id in official[region]['tree']){
                        if(users[region]['tree'][team_id]['team'] !== null){
                            completed_picks += 1; //you made a choice
                        }
                        var node = official[region]['tree'][team_id];

                        if(node.team !== null){
                            if(node.team.name == "Duke" && users[region]['tree'][team_id]['team']['name'] == "Duke"){
                                if(node.top !== null){
                                    if(official[region]['tree'][node.top]['team'] != null){
                                        if(official[region]['tree'][node.top]['team']['name'] != "Duke" && users[region]['tree'][node.top]['team']['name'] != "Duke"){
                                            giveAchievement("Hunter")
                                        }
                                    }
                                }
                            }

                            if($scope.getRound(team_id) >= 3 && parseInt(node.team.seed) < 5 && users[region]['tree'][team_id]['team']['name'] == node.team.name){
                                if(node.top !== null){
                                    if(official[region]['tree'][node.top]['team'] != null){
                                        if(official[region]['tree'][node.top]['team']['name'] != node.team.name && users[region]['tree'][node.top]['team']['name'] != node.team.name){
                                            giveAchievement("Haters gonna hate")
                                        }
                                    }
                                }
                            }
                        }
                        if(node.team !== null && node.left !== null){
                            var winning_team = node.team.name;
                            var this_team_color = node.team.color;
                            var left_score = official[region]['tree'][node.left]['score'];
                            var left_team = official[region]['tree'][node.left]['team'];
                            var left_team_color = official[region]['tree'][node.left]['team']['color']
                            var right_team = official[region]['tree'][node.right]['team'];
                            var right_team_color = official[region]['tree'][node.right]['team']['color']
                            var left_team_name = official[region]['tree'][node.left]['team']['name'];
                            var right_team_name = official[region]['tree'][node.right]['team']['name'];
                            var chosen_team_name = users[region]['tree'][team_id]['team']['name'];
                            var right_score = official[region]['tree'][node.right]['score'];
                            var left_seed =parseInt(official[region]['tree'][node.left]['team']['seed']);
                            var right_seed =parseInt(official[region]['tree'][node.right]['team']['seed']);
                            var chosen_seed = parseInt(users[region]['tree'][team_id]['team']['seed']);
                            var your_left_team = users[region]['tree'][node.left]['team'];
                            var your_right_team = users[region]['tree'][node.right]['team'];
                            var round = $scope.getRound(team_id)
                            var next_node = null;
                            var your_next_node = null;
                            if(node.top == null){
                                if(region != 'championship'){
                                    var championship_seed = $scope.championship_map[region]
                                    var next_top = official['championship']['tree'][championship_seed]['top']
                                    next_node = official['championship']['tree'][next_top]
                                    your_next_node = users['championship']['tree'][next_top]
                                }
                            }else{
                                next_node = official[region]['tree'][node.top]
                                your_next_node = official[region]['tree'][node.top]
                            }





                            //do the worst loss first
                            if(node.team.name != users[region]['tree'][team_id]['team']['name']){ //you don't have the right pick
                                var yourChampion = users['championship']['tree'][1]['team']['name']
                                if(yourChampion == left_team_name || yourChampion == right_team_name){
                                    if(round == 3){
                                        giveAchievement("1 and Done");
                                    }
                                    if(region == 'championship' && team_id == 1){
                                        if(parseInt(official['championship']['tree'][1]['team']['seed']) > parseInt(users['championship']['tree'][1]['team']['seed'])){
                                            giveAchievement("18-1");
                                        }

                                    }
                                }
                                if((left_team_name == your_left_team.name && left_team_name != node.team.name && chosen_team_name != your_left_team.name && chosen_seed > left_seed && parseInt(node.team.seed) > left_seed )
                                    || (right_team_name == your_right_team.name && right_team_name != node.team.name && chosen_team_name != your_right_team.name && chosen_seed > right_seed && parseInt(node.team.seed) > right_seed)){
                                    if(round < 3){
                                        reverser_choices += 1;

                                    }

                                }
                                if($scope.rightTeamsInMatchup(region, node, bracket)){
                                    tough_luck += 1;
                                    if(next_node != null){
                                        if(next_node.team != null && next_node.team.name != node.team.name){
                                            payback_count += 1;
                                        }
                                    }

                                    if(users[region]['tree'][team_id]['team']['seed'] < node.team.seed){

                                    }

                                    if(((left_team_color == 'red' && winning_team!= left_team_name) ||
                                        (right_team_color == 'red' && winning_team!= right_team_name)) && node.team.color == 'blue'){
                                        giveAchievement("Excalibur");
                                    }
                                    if(((left_team_color == 'blue' && winning_team!= left_team_name) ||
                                        (right_team_color == 'blue' && winning_team!= right_team_name) )&& node.team.color == 'red'){
                                        giveAchievement("Excalibur");
                                    }

                                }





                            }else{ //you picked the right winner
                                correct_picks += 1;
                                if(round==3){
                                    first_round_picks += 1;
                                }
                                if(region == "championship") {
                                    if(parseInt(node.team.seed) > 4 && round == 1){
                                        giveAchievement("Mordred");
                                    }
                                    if (team_id != 1) {
                                        two_for_two += 1
                                    }
                                }else{
                                    if(team_id == 2 || team_id == 3){
                                        percival_teams += 1;
                                    }
                                }
                                var regionalMatch = region + "_" + team_id;

                                if(billionaire_ids.indexOf(regionalMatch) > -1){
                                    billionaire_picks += 1;
                                }
                                ////upsets in round 1

                                if(node.team.mascot == 'dog'){
                                    dog_count += 1;
                                }
                                if(node.team.mascot == 'cat'){
                                    cat_count += 1
                                }
                                if(round < 3 || (region == 'championship' && round != 2)){
                                    var temp_round = round;
                                    var championship_round_match = {
                                        1: 3,
                                        0: 4
                                    }
                                    if(region == 'championship'){
                                        temp_round = championship_round_match[round]
                                    }
                                    if(node.team.color == 'red'){
                                        lady_red_rounds[temp_round] = true;
                                        console.log(username + "GOT A RED IN " + temp_round + " - " + node.team.name)
                                        console.log("RED IS ")
                                        console.log()
                                    }
                                    if(node.team.color == 'blue'){
                                        lady_blue_rounds[temp_round] = true;
                                        console.log(username + "GOT A BLUE IN " + temp_round+ " - " + node.team.name)
                                    }

                                    if(lady_red_rounds[temp_round] && lady_blue_rounds[temp_round]){

                                        giveAchievement("Lady of the Lake");
                                    }
                                }


                                if($scope.rightTeamsInMatchup(region, node, bracket)){ //have 3 teams right
                                    //
                                    if(node.team.color != 'blue' && node.team.color != 'red'){
                                        if((left_team_color == 'red' && winning_team!= left_team_name) ||
                                            (right_team_color == 'red' && winning_team!= right_team_name)){
                                            if(oberon_reds_defeated.indexOf(winning_team) == -1){
                                                oberon_reds_defeated.push(winning_team)
                                            }
                                            if(oberon_blues_defeated.indexOf(winning_team) > -1){
                                                console.log("OBERON FOR " + winning_team)
                                                giveAchievement("Oberon");
                                            }
                                        }
                                        if((left_team_color == 'blue' && winning_team!= left_team_name) ||
                                            (right_team_color == 'blue' && winning_team!= right_team_name)){
                                            if(oberon_blues_defeated.indexOf(winning_team) == -1){
                                                oberon_blues_defeated.push(winning_team)
                                            }
                                            if(oberon_reds_defeated.indexOf(winning_team) > -1){
                                                console.log("OBERON FOR " + winning_team)
                                                giveAchievement("Oberon");
                                            }
                                        }
                                    }

                                    if(((left_team_color == 'red' && winning_team!= left_team_name) ||
                                        (right_team_color == 'red' && winning_team!= right_team_name) )&& node.team.color == 'blue'){
                                        giveAchievement("Burning red");
                                    }

                                }
                            }

                            //if left is red and your left is red and this isnt left and your this isnt that, or with right, then get a red point
                            if((left_team_color == 'red' && left_team_name==your_left_team.name && winning_team!= left_team_name) ||
                                (right_team_color == 'red' && right_team_name==your_right_team.name && winning_team!= right_team_name)){

                            }
                        }

                    }
                }

                var final_score_chosen = [parseInt(users['championship']['tree'][2]['score']),parseInt(users['championship']['tree'][3]['score'])]
                var official_final_score = [official['championship']['tree'][2]['score'],official['championship']['tree'][3]['score']]
                if(Math.abs(final_score_chosen[0]+final_score_chosen[1]-official_final_score[0]-official_final_score[1])<=5){
                    giveAchievement("Jackpot");
                }
                var chosen_winning_number_index = final_score_chosen[0] > final_score_chosen[1] ? 0 : 1;
                var actual_winning_index = official_final_score[0] > official_final_score[1] ? 0 : 1;
                if(Math.abs(final_score_chosen[chosen_winning_number_index]-official_final_score[chosen_winning_number_index])<=7 &&
                    Math.abs(final_score_chosen[1-chosen_winning_number_index]-official_final_score[1-actual_winning_index])<=7){
                    giveAchievement("Numbers Whiz");
                }

                //25%
                if(official['championship']['tree'][1]['team'] !== null) {
                    for(var i = 4; i < 7; i++){
                        if(official['championship']['tree'][i]['team']['name'] == official['championship']['tree'][1]['team']['name']){
                            if(users['championship']['tree'][i]['team']['name'] == users['championship']['tree'][1]['team']['name']){
                                giveAchievement("25% Chance");
                            }
                        }
                    }
                }

                //blackout


                //give achievements
                if(completed_picks == 131){
                    giveAchievement("Completed Bracket");
                }
                if(dog_count >= 10){
                    giveAchievement("I Say I Like Dogs");
                }
                if(tough_luck >= 20){
                    giveAchievement("Tough Luck");
                }
                if(cat_count >= 15){
                    giveAchievement("But I Really Like Cats");
                }
                if(correct_picks >= 10){
                    giveAchievement("Random Picker");
                }
                if(correct_picks >= 25){
                    giveAchievement("Good Guesser");
                }
                if(correct_picks >= 50){
                    giveAchievement("Inside Trader");
                }
                if(billionaire_picks == 12){
                    giveAchievement("Possible Billionaire");
                }
                if(two_for_two == 6){
                    giveAchievement("Two for Two");
                }
                if(two_for_two == 6){
                    giveAchievement("Two for Two");
                }
                if(first_round_picks>=24){
                    giveAchievement("Frontrunner");
                }
                if(payback_count >= 12){
                    giveAchievement("Payback");
                }
                if(merlin_teams >= 3){
                    giveAchievement("Merlin");
                }
                if(reverser_choices >= 6){
                    giveAchievement("Reverser");
                }
                if(percival_teams >= 5){
                    giveAchievement("Percival");
                }
                if(merlin_teams < 3 && percival_teams >= 5){
                    giveAchievement("Morgana");
                }

                console.log("REVERSER?! " + reverser_choices)




				//box achievements
				console.log($scope.boxWinningsByUser)
				if(!(username in $scope.boxWinningsByUser) && official['championship']['tree'][1]['team'] !== null){
					giveAchievement("Knocked Out");
				}
				if(username in $scope.boxWinningsByUser){
					var myWins = $scope.boxWinningsByUser[username]
					if(myWins.length == 1 && official['championship']['tree'][1]['team'] !== null){
						giveAchievement("Long Count");
					}
					if(myWins.length >= 10){
						giveAchievement("Journeyman");
					}
					if(myWins.length >= 25){
						giveAchievement("Gatekeeper");
					}
					if(myWins.length >= 50){
						giveAchievement("Contender");
					}
					var round_wins = {};
					var round_achievements = {
						1: "Left Hook",
						2: "Right Jab",
						3: "Left Cross",
						4: "Uppercut",
						5: "Liver Shot",
						6: "One Hit KO"
					}
					for(var i = 0; i < myWins.length; i++){
						var win = myWins[i];
						if(!(win.round in round_wins)){
							round_wins[win.round] = 1;
						}else{
							round_wins[win.round] += 1;
						}
						console.log(round_wins)
						if(round_wins[win.round] >= 2){
							giveAchievement("One-two Combo");
						}
						if(round_wins[win.round] >= 4){
							giveAchievement("Outpoint");
						}
						if(round_wins[win.round] >= 8){
							giveAchievement("Below the Belt");
						}
						giveAchievement(round_achievements[win.round]);
					}

				}
                return achievements
            }




            $scope.rightTeamsInMatchup = function(region, node, bracket){
                var official = $scope.officialBracket;
                var users = bracket;
                var left_node = official[region]['tree'][node.left]
                var right_node = official[region]['tree'][node.right]
                return(left_node.team.name == users[region]['tree'][node.left]['team']['name'] && right_node.team.name == users[region]['tree'][node.right]['team']['name'])
            }
            $scope.getRegionNameForTeamID = function(region, team_id){
                var regionMap = {
                    3: "Round of 64",
                    2: "Round of 32",
                    1: "Round of 16",
                    0: "Elite Eight"
                }
                var championshipMap = {
                    1: "Final Four",
                    0: "National Championship Game"
                }
                if(region == "championship"){
                    var round = Math.floor(Math.log(team_id)/Math.log(2))
                    if(round > 2) {
                        return null;
                    }else{
                        return(championshipMap[round])
                    }
                }else{
                    var round = Math.floor(Math.log(team_id)/Math.log(2))
                    if(round > 3) {
                        return null;
                    }else{
                        return(regionMap[round])
                    }
                }
            }
            $scope.getChampion = function(region){
                var team = $scope.officialBracket[region]['tree'][1]['team']
                if(team===null) {
                    return "NONE YET"
                }
                return "(" + team['seed'] + ") " + team['name'];
            }
			$scope.levels = function(region) {
				return $scope.getLevels(Object.keys($scope.officialBracket[region]['tree']).length);
			};

			$scope.getTeam = function(region, index) {
				return $scope.officialBracket[region]['tree'][index];
			};
			$scope.getTeamName = function(region, level, matchup, first) {
				var index = Math.pow(2, level) - 1 + 2*matchup + first;
                var node = $scope.getTeam(region, index);
                if(node['team'] != null){
                    var team = node['team']
                    var result = "(" + team['seed'] + ") " + team['name'] + "SCORE: " + node['score']
                    return result;
                }else{
                    return "NONE YET"
                }

			};
            $scope.scoreOf = function(region, level, matchup, first) {
                var index = Math.pow(2, level) - 1 + 2*matchup + first;
                var node = $scope.getTeam(region, index);
                var result = node['score'];
                return result;
            };
            $scope.game_scores = {};
            $scope.createSelectionGetterSetter = function(region, level, matchup, first) {
                var index = Math.pow(2, level) - 1 + 2*matchup + first;
                if($scope.game_scores[region] == undefined){
                    $scope.game_scores[region] = {}
                }
                if($scope.game_scores[region][index] == undefined) {
                    $scope.game_scores[region][index] = {
                        select: function(newValue) {
                            if (angular.isDefined(newValue)) {
                                $scope.game_scores[region][index].val = newValue;
                                $scope.getTeam(region, index)['score'] = newValue;
                            }
                            return $scope.game_scores[region][index].val;
                        },
                        val: $scope.scoreOf(region, level, matchup, first)
                    }
                }

                return $scope.game_scores[region][index].select;
            };

            //watch for scores
            for(var region in $scope.officialBracket){
                for(var team in $scope.officialBracket[region]['tree']) {
                    $scope.$watchCollection('officialBracket["'+region+'"]["tree"]["'+team+'"]', function (newval, oldval) {
                    if(newval){
                        var new_region = newval['region']
                        var new_score = newval['score']
                        var other_team = newval['other_team']
                        var new_top = newval['top']
                        var team = newval['team']
                        if(other_team !=0){
                            if(new_score > $scope.getTeam(new_region,other_team)['score']){
                                $scope.officialBracket[new_region]['tree'][new_top]['team'] = team;
                            }else if(new_score == $scope.getTeam(new_region,other_team)['score']){
                                $scope.officialBracket[new_region]['tree'][new_top]['team'] = null;
                            }
                        }else{
                            if(new_region != 'championship')
                                $scope.officialBracket['championship']['tree'][$scope.championship_map[new_region]]['team'] = team;
                        }

                    }
                    });
                }
            }
            console.log("GETTING DATA")
            $http.get('/admin/getUserData.json').success(function(data){

                $scope.users = data;
                $scope.scoreboard = {};
                $scope.user_money_board = {};
                for(var u in $scope.users){
                    var username = $scope.users[u]['username'];
                    if(!(username in $scope.achievementsByUser)){
                        $scope.achievementsByUser[username] = [];
                        for(var i = 0; i < $scope.achievements.length; i++){
                            $scope.achievementsByUser[username].push({
                                'achievement': $scope.achievements[i],
                                'owned': false
                            })
                        }
                    }
                }
                console.log($scope.achievementsByUser)
				if($scope.brackets_opened){
					$scope.recalculateBox()
					$scope.recalculateScores();
				}

            }).error(function(data){
                console.log(data);
            });
			$scope.recalculateBox = function(){
				$scope.boxWinningsByUser = {} // reset this...
				var box_dict = {};
				for(var i = 1; i < 7; i++){
					box_dict['round_' + i] = {};
				}
				for(var i = 0; i < $scope.winning_numbers.length; i++){ //0->6,1->5...
					var winning_number_dict = {};
					for(var j = 0; j < $scope.winning_numbers[i].length; j++){
						winning_number_dict[$scope.winning_numbers[i][j]] = j;
					}
					box_dict['round_' + (6-i)]['winning_dict'] = winning_number_dict;
				}
				for(var i = 0; i < $scope.losing_numbers.length; i++){
					var losing_number_dict = {};
					for(var j = 0; j < $scope.losing_numbers[i].length; j++){
						losing_number_dict[$scope.losing_numbers[i][j]] = j;
					}
					box_dict['round_' + (6-i)]['losing_dict'] = losing_number_dict;
				}
				var roundMap = {
					1: "Round of 64",
					2: "Round of 32",
					3: "Round of 16",
					4: "Elite Eight",
					5: "Final Four",
					6: "National Championship Game"
				};
				var official = $scope.officialBracket;
				for(var region in official){
					for(var team_id in official[region]['tree']){
						var node = official[region]['tree'][team_id];

						if(node.team !== null && node.left !== null){
							var round = $scope.getRound(team_id); //this looks at the WINNER of each matchup and then looks at the left and right, to prevent double counting
							var box_round = 4-round; //regions: 3 = 1, 2 = 2, 1 = 3, 0 = 4; championship: 1 = 5, 0 = 6
							if(region=='championship'){
								box_round = 6-round;
							}
							console.log(box_round)

							var left_node = official[region]['tree'][node.left];
							var right_node = official[region]['tree'][node.right];
							var winning_team_node = left_node.score > right_node.score ? left_node: right_node;
							var losing_team_node = left_node.score < right_node.score ? left_node: right_node;
							var winning_score = winning_team_node.score;
							var losing_score = losing_team_node.score;
							var winning_number = winning_score % 10;
							var losing_number = losing_score % 10;
							var winner_index = box_dict['round_' + box_round]['winning_dict'][winning_number]
							var loser_index = box_dict['round_' + box_round]['losing_dict'][losing_number]
							var winner_username = $scope.player_numbers[loser_index][winner_index]

							if(!(winner_username in $scope.boxWinningsByUser)){
								$scope.boxWinningsByUser[winner_username] = [];
							}
							$scope.boxWinningsByUser[winner_username].push({round: box_round, winning_team: winning_team_node.team.name, losing_team: losing_team_node.team.name,
							winning_score: winning_score, losing_score: losing_score, winning_number: winning_number, losing_number: losing_number})
						}

					}
				}

				$http.post('/admin/setSetting', {setting: 'boxWinningsByUser', val: $scope.boxWinningsByUser }).success(function(data){
					console.log("SAVED BOX WININGS!");
				}).error(function(data){

				});
			}
            $scope.recalculateScores = function(){
				function calculateBoxScore(boxes){
					var score = 0;
					if(boxes == null || boxes == undefined){
						return 0;
					}
					for(var i = 0; i < boxes.length; i++){
						score += Math.pow(2,boxes[i]['round']-1)
					}
					return score;
				}
                for(var s in $scope.users){
                    var user =  $scope.users[s];
					console.log('getting score for ' + user.username)
					console.log($scope.scoreboard);
                    $scope.scoreboard[user.username] = $scope.determineScore(user.bracket);
                    $scope.user_money_board[user.username] = $scope.calculateMoneyBoard(user.username, user.bracket);
                    $scope.achievementsByUser[user.username] = $scope.calculateUserAchievements( $scope.achievementsByUser[user.username], user.username, user.bracket);

                    console.log(user.username + " has a score of " + $scope.scoreboard[user.username]['Total Score'])
					var achievements = 0;
					var resistance_achievements = 0;
					var ts_achievements = 0;
					var start_box_achievement = 20;
					var start_resistance_achievement = 34;
					var start_ts_achievement = 45;
					for(var i = 0; i < $scope.achievementsByUser[user.username].length; i++){
						if($scope.achievementsByUser[user.username][i]['owned']){
							achievements += 1;
						}
						if(i >=start_resistance_achievement && i < start_ts_achievement){
							if($scope.achievementsByUser[user.username][i]['owned']){
								resistance_achievements += 1;
							}

						}else if(i >= start_ts_achievement){
							if($scope.achievementsByUser[user.username][i]['owned']){
								ts_achievements += 1;
							}
						}
					}
					console.log(user.username + " has achieveements of " +achievements)
					$scope.scoreboard[user.username]['Achievements'] = achievements
					$scope.user_money_board[user.username]["Most Achievements"] = {'info':'','value':achievements};
					$scope.user_money_board[user.username]["Most Resistance Achievements"] = {'info':'','value':resistance_achievements};
					$scope.user_money_board[user.username]["Most Taylor Swift Achievements"] = {'info':'','value':ts_achievements};
					$scope.user_money_board[user.username]["Most Points in Squares"] = {'info':'','value':calculateBoxScore($scope.boxWinningsByUser[user.username])};

                }
                $scope.recalculateMoneyBoard();
                $http.post('/admin/setSetting', {setting: 'scores', val: $scope.scoreboard }).success(function(data){
                    console.log("SAVED SCORES!");
                }).error(function(data){

                });
            }
            $scope.recalculateMoneyBoard = function() {
                var determine_after_all_users = {
                    "First Place": 1, "Second Place" : 2, "Third Place": 3, "Sixth Place": 6, "Second to Last": Object.keys($scope.users).length - 1
                };
                for(var i = 0; i < $scope.moneyBoard.length; i++){
                    var curItem =  $scope.moneyBoard[i]
                    if(!curItem['final']){
                        var category =curItem['category'];
                        if(!(category in determine_after_all_users)) {
                            for (var s in $scope.users) {
                                var user = $scope.users[s];
                                var username = user.username;
                                var users_moneyboard = $scope.user_money_board[username];

                                if (users_moneyboard[category]['value'] > curItem['score']) { // new leader
                                    curItem['score'] = users_moneyboard[category]['value'];
                                    curItem['player'] = [username];
									if(users_moneyboard[category]['info'] != null){
										curItem['info'] = users_moneyboard[category]['info'];
									}

                                    curItem['multiple'] = false;
                                } else if (users_moneyboard[category]['value'] == curItem['score']) { //tied
                                    if (curItem['player'].indexOf(username) < 0) {
										if(curItem['info'] != null){
											curItem['info'] += '<br>' + users_moneyboard[category]['info'];
										}

                                        curItem['player'].push(username);//if youre not in it already
                                    }

                                    curItem['multiple'] = true;
                                }
                            }
                        }
                    }
                }

                var sortable = [];
                for (var user in $scope.scoreboard)
                    sortable.push([user, $scope.scoreboard[user]['Total Score']])
                sortable.sort(function(a, b) {return b[1] - a[1]})
                var sorted_scoredboard = sortable;

                for(var i = 0; i < $scope.moneyBoard.length; i++){
                    var curItem =  $scope.moneyBoard[i]
                    if(!curItem['final']){
                        var category=curItem['category'];
                        if(category in determine_after_all_users) {
                            var ranking = determine_after_all_users[category];
                            if (ranking <= sorted_scoredboard.length) {
                                var ranking_score = sorted_scoredboard[ranking - 1][1];
                                curItem['score'] = ranking_score;
                                var winners = [];
                                for (var username in $scope.scoreboard) {
                                    var user = $scope.scoreboard[username];
                                    var users_score = user["Total Score"];
                                    if (users_score == ranking_score) {
                                        winners.push(username)
                                    }
                                }
                                curItem['player'] = winners;
                                curItem['multiple'] = winners.length != 1

                            }else{

                            }
                        }
                    }
                }

            }
			$scope.saveNumbers = function() {
				$http.post('/admin/setSetting', {setting: 'winning_numbers', val: $scope.winning_numbers }).success(function(data){
					console.log("SAVED winning numbers");
					$http.post('/admin/setSetting', {setting: 'losing_numbers', val: $scope.losing_numbers }).success(function(data){
						console.log("SAVED losing numbers");
						$http.post('/admin/setSetting', {setting: 'player_numbers', val: $scope.player_numbers }).success(function(data){
							console.log("SAVED player numbers");
							var myAlert = $alert({content: 'Saved!.', type: 'success',
								container: "#saved-numbers-alert",
								duration:1,
								show: true});
						}).error(function(data){
							console.log("No data1");
						});
					}).error(function(data){
						console.log("No data2");
					});
				}).error(function(data){
					console.log("No data3");

				});

			};
            $scope.saveOfficialBracket = function() {
				if($scope.brackets_opened) {
					alert("CLOSE THE FUCKIGN BRACKETS IDIOT");
					return;
				}
                $http.post('/admin/setSetting', {setting: 'officialBracket', val: $scope.officialBracket }).success(function(data){
                    console.log("SAVED!");
					$scope.recalculateBox()
                    $scope.recalculateScores()

                    var myAlert = $alert({content: 'Saved!.', type: 'success',
                        container: "#saved-alert",
                        duration:1,
                        show: true});

					$scope.saveAchievements();
					$scope.saveMoneyboard();
                }).error(function(data){
                    console.log("No data");

                });

            };
            $scope.saveMoneyboard = function() {
				if($scope.brackets_opened) {
					alert("CLOSE THE FUCKIGN BRACKETS IDIOT");
					return;
				}
                $http.post('/admin/setSetting', {setting: 'moneyBoard', val: $scope.moneyBoard }).success(function(data){
                    console.log("SAVED!");
                    var myAlert = $alert({content: 'Saved!.', type: 'success',
                        container: "#saved-moneyboard-alert",
                        duration:1,
                        show: true});
                }).error(function(data){
                    console.log("No data");

                });

            };
            $scope.saveAchievements = function() {
				if($scope.brackets_opened) {
					alert("CLOSE THE FUCKIGN BRACKETS IDIOT");
					return;
				}
                $http.post('/admin/setSetting', {setting: 'achievementsByUser', val: $scope.achievementsByUser }).success(function(data){
                    console.log("SAVED!");
                    var myAlert = $alert({content: 'Saved!.', type: 'success',
                        container: "#saved-achievements-alert",
                        duration:1,
                        show: true});
                }).error(function(data){
                    console.log("No data");

                });

            };

            $scope.selectedUserForAchievements = "test"


		}).error(function(data){
			console.log("No data");

		});
    }

	$scope.toggleBrackets = function(val){
		$http.post('/admin/setSetting', {setting: 'bracketOpened', val: !$scope.brackets_opened }).success(function(data){
			$scope.brackets_opened = !$scope.brackets_opened;
		}).error(function(data){
			console.log("No data");

		});

	}


    $scope.init();

	$scope.getLevels = function(n) {
		return new Array(Math.log(n+1)/Math.log(2));
	};

	$scope.getMatchups = function(n) {
		return new Array(Math.pow(2, n-1));
	};

	$scope.matchupName = function(region, level) {
		var champ_dict = {
			1: "NATIONAL CHAMPIONSHIP GAME",
			2: "FINAL FOUR"
		}
		var region_dict = {
			1: "ELITE EIGHT",
			2: "ROUND OF 16",
			3: "ROUND OF 32",
			4: "ROUND OF 64"
		}
		if(region=="championship"){
			return champ_dict[level]
		}
		return region_dict[level];
	};


  }]);