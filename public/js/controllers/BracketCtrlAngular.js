angular.module('BracketCtrlAngular', ['ui.bootstrap']).controller('BracketControllerAngular', ['$scope', '$rootScope', '$http', 'bracketFactory','$window', 'userInfoFactory', function($scope, $rootScope, $http, bracketFactory, $window, userInfoFactory) {
	$scope.base_height = 20;
    $scope.setUsername = function(n){
        $scope.username = n == undefined ? $window.sessionStorage.user :  n;
    };
	$scope.round = function(x){
		return Math.round(x);
	};
    $scope.getTeamID = function(region, round, matchup, team_num){
        if(region == 4){
            return Math.pow(2,(2-round)) + (2*matchup) + (team_num-1);
        }else{
            return Math.pow(2,(4-round)) + (2*matchup) + (team_num-1);
        }
        
    };
	$scope.brackets_opened = false;
	$scope.toggleColors = false;
	$scope.toggleMascots = false;
    $scope.completedPicks = 0;
    $scope.finalsPicked = false;
    $scope.showPickCounter = false;
    $scope.showShuffle = false;
    $scope.showErase = false;
    $scope.showColors = false;
	$http.get('/is_bracket_opened.json').success(function(data){
		$scope.brackets_opened = data['result']
		if(!$scope.brackets_opened){
			$http({
				url: '/getUsers.json', method: "GET"
			}).success(function(data){
				$scope.users = data;
			}).error(function(){

			});
		}
	}).error(function(data){
		console.log(data);
	});


	$scope.loadBrackets = function(){
        $scope.$watch("username", function() {
            bracketFactory.getSavedBracket($scope.username).then(function (data) {
                $scope.data = data;
                $scope.finals_1_projected_score = $scope.data['championship']['tree'][2]['score']
                $scope.finals_2_projected_score = $scope.data['championship']['tree'][3]['score']
                $scope.storeBracketAsSaved();

                $scope.status = {
                    isopen: false
                };

                $scope.toggled = function (open) {
                    $log.log('Dropdown is now: ', open);
                };

                $scope.toggleDropdown = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.status.isopen = !$scope.status.isopen;
                };
                $scope.getTeamColor = function (regionID, round, matchup, team_num, team_id_given) {
                    var region = $scope.region_dict[regionID];
                    var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
                    if ($scope.data[region]['tree'][team_id]['team'] == null) {
                        return null;
                    }
                    return ($scope.data[region]['tree'][team_id]['team']['color']);
                };
                $scope.getTeamMascot = function (regionID, round, matchup, team_num, team_id_given) {
                    var region = $scope.region_dict[regionID];
                    var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
                    if ($scope.data[region]['tree'][team_id]['team'] == null) {
                        return null;
                    }
                    return ($scope.data[region]['tree'][team_id]['team']['mascot']);
                };
                $scope.getTeam = function (regionID, round, matchup, team_num, team_id_given) {
                    var region = $scope.region_dict[regionID];
                    var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
                    if ($scope.data[region]['tree'][team_id]['team'] == null) {
                        return null;
                    }
                    return ($scope.data[region]['tree'][team_id]['team']);
                };
                $scope.getTeamSeed = function (regionID, round, matchup, team_num, team_id_given) {
                    var region = $scope.region_dict[regionID];
                    var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
                    if ($scope.data[region]['tree'][team_id]['team'] == null) {
                        return null;
                    }
                    return ($scope.data[region]['tree'][team_id]['team']['seed']);
                };
                $scope.getTeamName = function (regionID, round, matchup, team_num, team_id_given) {
                    var region = $scope.region_dict[regionID];
                    var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
                    if ($scope.data[region]['tree'][team_id]['team'] == null) {
                        return null;
                    }
                    return ($scope.data[region]['tree'][team_id]['team']['name']);
                };
                $scope.setTeam = function (regionID, round, matchup, team_num, team, team_id_given) {
                    var region = $scope.region_dict[regionID];
                    var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
                    if ($scope.data[region]['tree'][team_id]['team'] == null) {
                        $scope.data[region]['tree'][team_id]['team'] = {}
                    }

                    $scope.data[region]['tree'][team_id]['team'] = JSON.parse(JSON.stringify(team));
                };
                $scope.removeFromTop = function (regionID, name, top_node_id) {
                    var region = $scope.region_dict[regionID];
                    if ($scope.getTeamName(regionID, 0, 0, 0, top_node_id) == name) {
                        $scope.data[region]['tree'][top_node_id]['team'] = null;
                    }
                    if ($scope.data[region]['tree'][top_node_id]['top'] != null) {
                        $scope.removeFromTop(regionID, name, $scope.data[region]['tree'][top_node_id]['top']);
                    } else if ($scope.data[region]['tree'][top_node_id]['top'] == null && regionID != 4) {
                        $scope.removeFromTop(4, name, $scope.championship_map[region]); //remove from championship
                        if ($scope.getTeamName(4, 0, 0, 0, $scope.championship_map[region]) == name) {
                            $scope.data["championship"]['tree'][$scope.championship_map[region]]['team'] = null;
                        }
                    }
                };
                $scope.getChampion = function (regionID) {
                    var region = $scope.region_dict[regionID];
                    return $scope.getTeamName(regionID, 0, 0, 0, 1);
                };
                $scope.getChampionColor = function () {
                    return $scope.getTeamColor(4, 0, 0, 0, 1);
                };
                $scope.getChampionMascot = function () {
                    return $scope.getTeamMascot(4, 0, 0, 0, 1);
                };
                $scope.moveTop = function (regionID, round, matchup, team_num, forced, team_id_given) {
					if(!$scope.brackets_opened && !forced){
						return;
					}
                    if (forced === undefined) {

                        var iAmforced = false;
                    } else {
                        var iAmforced = true;
                    }
                    if (!$scope.skipped_bracket_page && !iAmforced) {
                        return;
                    }
                    var region = $scope.region_dict[regionID];
                    var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);

                    var top_node_id = $scope.data[region]['tree'][team_id]['top'];
                    var team = $scope.getTeam(regionID, 0, 0, 0, team_id);
                    var team_name = $scope.getTeamName(regionID, 0, 0, 0, team_id);
                    $scope.setTeam(regionID, 0, 0, 0, team, top_node_id);
                    var other_team_id = $scope.data[region]['tree'][top_node_id]['left'] == team_id ? $scope.data[region]['tree'][top_node_id]['right'] : $scope.data[region]['tree'][top_node_id]['left'];
                    var other_team_name = $scope.getTeamName(regionID, 0, 0, 0, other_team_id);
                    if (other_team_name != null) {
                        $scope.removeFromTop(regionID, other_team_name, top_node_id);
                    }

                    if ($scope.data[region]['tree'][top_node_id]['top'] == null) { //champion
                        if (regionID != 4) {
                            $scope.setTeam(4, 0, 0, 0, team, $scope.championship_map[region]); //0->4 1->6 2->5 3->7
                        }
                    }

                };
                $scope.canClick = function (regionID, round, matchup, team_num) {
                    var region = $scope.region_dict[regionID];
                    var team_id = $scope.getTeamID(regionID, round, matchup, team_num);
                    var cur_team = $scope.data[region]['tree'][team_id];
                    var i_have_name = $scope.getTeamName(regionID, 0, 0, 0, team_id) != null;
                    var top_node_id = cur_team['top'];
                    var top_node;
                    if (top_node_id == null && regionID != 4) {
                        top_node = $scope.data['championship']['tree'][$scope.championship_map[region]];
                    } else if (top_node_id != null) {

                        top_node = $scope.data[region]['tree'][top_node_id];
                    } else {
                        return false;
                    }

                    var no_top_selected = $scope.getTeamName(regionID, 0, 0, 0, top_node_id) == null;
                    var top_node_has_my_name = $scope.getTeamName(regionID, 0, 0, 0, top_node_id) == $scope.getTeamName(regionID, 0, 0, 0, team_id);
                    return (i_have_name && no_top_selected) || (i_have_name && top_node_has_my_name);
                }
                $scope.choseToLose = function (regionID, round, matchup, team_num, team_id_given) {
                    var region = $scope.region_dict[regionID];

					var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
                    var cur_team = $scope.data[region]['tree'][team_id];
                    var i_have_name = $scope.getTeamName(regionID, 0, 0, 0, team_id) != null;
                    var top_node_id = cur_team['top'];
                    var top_node;

                    if (top_node_id == null && regionID != 4) {
                        top_node = $scope.data['championship']['tree'][$scope.championship_map[region]]
                    } else if (top_node_id != null) {
                        top_node = $scope.data[region]['tree'][top_node_id];
                    } else {
                        return false;
                    }

                    var top_node_has_name = $scope.getTeamName(regionID, 0, 0, 0, top_node_id) != null;
                    var top_node_does_not_have_my_name = $scope.getTeamName(regionID, 0, 0, 0, top_node_id) != $scope.getTeamName(regionID, 0, 0, 0, team_id);
                    return (i_have_name && top_node_does_not_have_my_name && top_node_has_name);
                }

                $scope.changedBracket = function () {
                    return JSON.stringify($scope.savedBracket) !== JSON.stringify($scope.data);
                };

                $scope.saveChanges = function () {
                    var new_bracket = $scope.data;
                    bracketFactory.saveBracket($window.sessionStorage.token, $window.sessionStorage.user, new_bracket).success(function () {
                        alert("SAVED");
                        $scope.storeBracketAsSaved();
                    }).error(function (status, data) {
                        console.log("SOERROR");
						alert(status);
                        console.log(status);
                        console.log(data);
                    });
                };

                $scope.clearBracket = function (forced) {
					if(!$scope.brackets_opened && !forced){
						return;
					}
					if(!forced && !confirm("Are you sure? This will clear your brackets!")){
						return;
					}
                    for (var k = 0; k < 4; k++) {
                        var region = $scope.region_dict[k];
                        for (var j = 16; j < 32; j++) {
                            var node = $scope.data[region]['tree'][j];
                            if ($scope.getTeamName(k, 0, 0, 0, j) != null) {
                                var top_node_id = node['top'];

                                var team_name = $scope.getTeamName(k, 0, 0, 0, j);

                                $scope.removeFromTop(k, team_name, top_node_id);
                            }
                        }
                    }
                };

                $scope.randomizePicks = function (forced) {
					if(!$scope.brackets_opened && !forced){
						return;
					}
					if(!forced && !confirm("Are you sure? This will randomize the rest of your bracket!")){
						return;
					}
                    if (forced === undefined) {
                        var iAmforced = false;
                    } else {
                        var iAmforced = true;
                    }
                    if (!$scope.skipped_bracket_page && !iAmforced) {
                        return;
                    }
                    var round = 4;
                    //go from 8 to 15, and then 4 to 7, and then 2 to 3 and then 1
                    for (var k = 0; k < 4; k++) {
                        var region = $scope.region_dict[k];
                        for (var j = 3; j > -1; j--) {
                            for (var i = Math.pow(2, j); i < Math.pow(2, j + 1); i++) {
                                var node = $scope.data[region]['tree'][i];
                                if ($scope.getTeamName(k, 0, 0, 0, i) == null) {
                                    var winning_team;
                                    if ($window.Math.random() > 0.5) {
                                        winning_team = node.left;
                                    } else {
                                        winning_team = node.right;
                                    }
                                    $scope.moveTop(k, 0, 0, 0, forced, winning_team);

                                }
                            }
                        }
                    }
                    for (var j = 1; j > -1; j--) {
                        for (var i = Math.pow(2, j); i < Math.pow(2, j + 1); i++) {
                            var node = $scope.data['championship']['tree'][i];
                            if ($scope.getTeamName(4, 0, 0, 0, i) == null) {
                                var winning_team;
                                if ($window.Math.random() > 0.5) {
                                    winning_team = node.left;
                                } else {
                                    winning_team = node.right;
                                }
                                $scope.moveTop(4, 0, 0, 0, forced, winning_team);

                            }
                        }
                    }

                }

                $scope.pickCountTotal = function () {
                    var picks = 0;
                    var total_picks = 0;
                    //go from 8 to 15, and then 4 to 7, and then 2 to 3 and then 1
                    for (var k = 0; k < 4; k++) {
                        var region = $scope.region_dict[k];
                        for (var j = 3; j > -1; j--) {
                            for (var i = Math.pow(2, j); i < Math.pow(2, j + 1); i++) {
                                var node = $scope.data[region]['tree'][i];
                                total_picks += 1;
                                if ($scope.getTeamName(k, 0, 0, 0, i) != null) {
                                    picks += 1;
                                }
                            }
                        }
                    }
                    for (var j = 1; j > -1; j--) {
                        for (var i = Math.pow(2, j); i < Math.pow(2, j + 1); i++) {
                            var node = $scope.data['championship']['tree'][i];
                            total_picks += 1;
                            if ($scope.getTeamName(4, 0, 0, 0, i) != null) {
                                picks += 1;
                            }
                        }
                    }
                    return {'Total Picks': total_picks, 'Completed Picks': picks};
                };


                $scope.finalsPicked = ($scope.getTeamName(4, 0, 0, 0, 1) != null && $scope.getTeamName(4, 0, 0, 0, 2) != null )
                $scope.getFlags();
                bracketFactory.getScoreboard($window.sessionStorage.user).then(function (data) {
                    $scope.score = data;
                    $scope.myScore = data[$scope.username]
                });
                bracketFactory.getOfficialBracket($window.sessionStorage.user).then(function (data) {
                    $scope.officialBracket = data;
                    $scope.getOfficialTeamColor = function (regionID, round, matchup, team_num, team_id_given) {
                        var region = $scope.region_dict[regionID];
                        var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
                        if ($scope.officialBracket[region]['tree'][team_id]['team'] == null) {
                            return null;
                        }
                        return ($scope.officialBracket[region]['tree'][team_id]['team']['color']);
                    };
                    $scope.getOfficialTeamMascot = function (regionID, round, matchup, team_num, team_id_given) {
                        var region = $scope.region_dict[regionID];
                        var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
                        if ($scope.officialBracket[region]['tree'][team_id]['team'] == null) {
                            return null;
                        }
                        return ($scope.officialBracket[region]['tree'][team_id]['team']['mascot']);
                    };
                    $scope.getOfficialTeam = function (regionID, round, matchup, team_num, team_id_given) {

                        var region = $scope.region_dict[regionID];
                        var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
                        if ($scope.officialBracket[region]['tree'][team_id]['team'] == null) {
                            return null;
                        }
                        return ($scope.officialBracket[region]['tree'][team_id]['team']);
                    };
                    $scope.getOfficialTeamName = function (regionID, round, matchup, team_num, team_id_given) {
                        var region = $scope.region_dict[regionID];
                        var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);


                        if ($scope.officialBracket[region]['tree'][team_id]['team'] == null) {
                            return null;
                        }
                        return ($scope.officialBracket[region]['tree'][team_id]['team']['name']);
                    };
                    $scope.getOfficialTeamSeed = function (regionID, round, matchup, team_num, team_id_given) {
                        var region = $scope.region_dict[regionID];
                        var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
                        if ($scope.officialBracket[region]['tree'][team_id]['team'] == null) {
                            return null;
                        }
                        return ($scope.officialBracket[region]['tree'][team_id]['team']['seed']);
                    };
                    $scope.getOfficialChampion = function (regionID) {

                        return $scope.getOfficialTeamName(regionID, 0, 0, 0, 1);
                    };
                    $scope.getOfficialChampionColor = function () {
                        return $scope.getOfficialTeamColor(4, 0, 0, 0, 1);
                    };
                    $scope.getOfficialChampionMascot = function () {
                        return $scope.getOfficialTeamMascot(4, 0, 0, 0, 1);
                    };

                    $scope.correctTeam = function (regionID, round, matchup, team_num, team_id_given) {
                        if (regionID != 4 && round == 0) return false;
                        var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
                        var region = $scope.region_dict[regionID];
                        var officialName = $scope.getOfficialTeamName(regionID, 0, 0, 0, team_id);
                        var node = $scope.officialBracket[region]['tree'][team_id];
                        var myChoice = $scope.getTeamName(regionID, 0, 0, 0, team_id);
                        var result = officialName == myChoice;
						return (myChoice == officialName) && (officialName != null)
                    };
                    $scope.incorrectTeam = function (regionID, round, matchup, team_num, team_id_given) {
                        if (regionID != 4 && round == 0) return false;

                        var region = $scope.region_dict[regionID];
                        var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
						var officialName = $scope.getOfficialTeamName(regionID, round, matchup, team_num, team_id);
						var myChoice = $scope.getTeamName(regionID, round, matchup, team_num, team_id);
                        var result = officialName != myChoice;
                        var myChosenTeamName = $scope.data[region]['tree'][team_id]['team']['name'];
                        var is_eliminated = $scope.getTeamEliminated(regionID, team_id, myChosenTeamName);
                        if (is_eliminated) {
                            return true;
                        }
                        return result && officialName != null
                    };
                    $scope.getScore = function (regionID, round, matchup, team_num, team_id_given) {
                        var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
                        var region = $scope.region_dict[regionID];
                        var node = $scope.officialBracket[region]['tree'][team_id];
                        if (node.team == null) return null;
                        return node.score
                    };
                    $scope.teamChosen = function (regionID, round, matchup, team_num, team_id_given) {
                        var region = $scope.region_dict[regionID];
						if(region == 'championship'){
							return !$scope.eliminatedTeamInChampionshipByTeam(round, team_id_given)
						}
						var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);

                        var node = $scope.officialBracket[region]['tree'][team_id];

                        var myChosenTeamName = $scope.data[region]['tree'][team_id]['team']['name'];

                        if (round == 0 && region!= 'championship') {
                            return myChosenTeamName == node.team.name
                        }

                        var topNode = $scope.getOfficialTeamName(regionID, 0, 0, 0, node.top);
                        var officialName = $scope.getOfficialTeamName(regionID, 0, 0, 0, team_id);
                        var officialLeftName = $scope.getOfficialTeamName(regionID, 0, 0, 0, node.left);

                        var officialRightName = $scope.getOfficialTeamName(regionID, 0, 0, 0, node.right);
						var team_not_eliminated = false;
						if(region !== 'championship'){
							team_not_eliminated = (!$scope.getTeamEliminated(regionID, node.left, myChosenTeamName) || !$scope.getTeamEliminated(regionID, node.right, myChosenTeamName))
						}else{
							team_not_eliminated = !$scope.eliminatedTeamInChampionshipByTeam(round, team_id_given)

						}

                        return ((officialLeftName == myChosenTeamName || officialRightName == myChosenTeamName) || team_not_eliminated) && (officialName == null)
                    };

                    $scope.getTeamEliminated = function (regionID, team_id, myChosenTeamName) {
                        var testMe = regionID == 0 && team_id == 22 && myChosenTeamName == "Northern Iowa"
                        var region = $scope.region_dict[regionID];
                        var node = $scope.officialBracket[region]['tree'][team_id];
                        if (node.left == null) {
                            return node.team.name != myChosenTeamName;
                        }
                        if (node.team == null && (($scope.getOfficialTeamName(regionID, 0, 0, 0, node.left) == myChosenTeamName) || ($scope.getOfficialTeamName(regionID, 0, 0, 0, node.right) == myChosenTeamName))) {
                            return false;
                        }
                        if (node.team != null) {
                            if (node.team.name != myChosenTeamName && (($scope.getOfficialTeamName(regionID, 0, 0, 0, node.left) == myChosenTeamName) || ($scope.getOfficialTeamName(regionID, 0, 0, 0, node.right) == myChosenTeamName))) {

                                return true;
                            }
                        }

                        return $scope.getTeamEliminated(regionID, node.left, myChosenTeamName) && $scope.getTeamEliminated(regionID, node.right, myChosenTeamName);
                    };

					$scope.eliminatedTeamInChampionship  = function(round){
						if($scope.brackets_opened){ return false;}
						if(round == 0){
							//check champs of rounds
							for(var i = 0; i < 4; i++){
								var champ_chosen= $scope.getTeamName(i, 0, 0, 0, 1)
								if($scope.getTeamEliminated(i, 1, champ_chosen)){
									return true;
								}
							}
						}else if(round == 1){
							//check if eliminated below
							for(var i =2; i < 4; i++) {
								var this_team = $scope.getTeamName(4, 0, 0, 0, i)

								for (var j = 4; j < 8; j++) {
									var that_team = $scope.getTeamName(4, 0, 0, 0, j)

									if(this_team == that_team &&$scope.eliminatedTeamInChampionshipByTeam(0,j-4)) {
										return true;
									}
								}
							}
						}else if(round ==2 ){
							//check if eliminated below
							var this_team = $scope.getTeamName(4, 0, 0, 0, 1);
							for(var i = 2 ; i < 4; i++) {
								var that_team = $scope.getTeamName(4, 0, 0, 0, i)
								if(this_team == that_team &&$scope.eliminatedTeamInChampionshipByTeam(1,i-2)) {
									return true;
								}
							}
						}
						//0-> 4 to 8, 1-> 2 to 4; so it is 2^(2-round) to 2^(3-round)
						return false;
					}

					$scope.eliminatedTeamInChampionshipByTeam  = function(round, seed){
						if($scope.brackets_opened){ return false;}
						//0->4 1->6 2->5 3->7
						//seeds are 4,5,6,7, regions are 0,2,1,3

						if(round == 0){
							var real_seed = seed+4;
							var index_map = {
								4: 0,
								5: 2,
								6: 1,
								7: 3
							}
							//check champs of rounds
								var champ_chosen= $scope.getTeamName(index_map[real_seed], 0, 0, 0, 1)
								return $scope.getTeamEliminated(index_map[real_seed], 1, champ_chosen)


						}else if(round == 1){
							//check if eliminated below or eliminated here
							var this_team = $scope.getTeamName(4, 0, 0, 0, seed+2)
							var official_team = $scope.getOfficialTeamName(4,0,0,0,seed+2)
							if(official_team != null){ return this_team != official_team}
							for (var j = 4; j < 8; j++) {
								var that_team = $scope.getTeamName(4, 0, 0, 0, j)
								if(this_team == that_team) {
									return($scope.eliminatedTeamInChampionshipByTeam(0,j-4));
								}
							}
						}else if(round ==2 ){
							var this_team = $scope.getTeamName(4, 0, 0, 0, 1)
							for (var j = 2; j < 4; j++) {
								var that_team = $scope.getTeamName(4, 0, 0, 0, j)
								if(this_team == that_team) {
									return($scope.eliminatedTeamInChampionshipByTeam(1,j-2));
								}
							}
						}
						return false;
					}

					$scope.flavorText = function(){
						var your_score = $scope.myScore['Total Score'];
						if(your_score == 0){
							return "The tournament has started! Good luck!";
						}else if(your_score < 5){
							return "The tournament has started! Congrats on your first points!";
						}else if(your_score < 10){
							return "The tournament has started! Keep going!";
						}else if(your_score < 15){
							return "You're doing great, keep going!";
						}else if(your_score < 25){
							return "Not bad!";
						}else if(your_score < 40){
							return "Good job!";
						}else if(your_score < 50){
							return "Great score!";
						}else if(your_score < 75){
							return "I'm impressed!";
						}else if(your_score < 100){
							return "Wow! You are pretty good at this!";
						}else{
							return "Wow!! Have you considered gambling??";
						}
					}

                }, function (error) {
                    console.log(error);
                });


            });
        });
    };

	$scope.loadBrackets();

	$scope.storeBracketAsSaved = function(){
		$scope.savedBracket = JSON.parse(JSON.stringify($scope.data));
	}

	$scope.region_dict = {
		"0": "mid_west",
		"1": "east",
		"2": "west",
		"3": "south",
		"4": "championship"
	};

	$scope.championship_map = {
		"mid_west": 4,
		"west": 5,
		"east": 6,
		"south": 7
	};

	$scope.matchupCount=function(n){
		return new Array(8/Math.pow(2,n));
	};

	$scope.championshipCount=function(n){
		return new Array(3+2*n);
	};

	$scope.getNewHeight=function(i){
		return $scope.base_height*(Math.pow(2,i));
	};



	$scope.startJoyRide = false;
	$scope.start = function () {
        $scope.showShuffle = false;
        $scope.showErase = false;
        $scope.showColors = false;
        $scope.skipped_bracket_page = false;
        $scope.showPickCounter = false;
		$scope.startJoyRide = true;

	}
    var index = 0;
	$scope.config = [

		{//0
            index: index++,
			type: "title",
			heading: "THE BRACKET",
			text: '<div class="row"><div id="title-text" class="col-md-12"><span class="main-text">Welcome to <strong>THE BRACKET</strong></span><br><span>Please click "Next" to learn how to make picks, or click "Skip" if you already know.</span></div></div>',
			curtainClass: "championship-bracket"
		},
		{
            index: index++,
			type: "element",
			selector: ".teams",
			heading: "Basics (1)",
			text: "These are the teams in the tournament.",
			placement: "top",
            scrollPadding: 250,
            scroll: true
		},
		{//2
            index: index++,
			type: "element",
			selector: ".joyridecustom1",
			heading: "Basics (2)",
			text: "For each matchup, click on the team you think will win.",
			placement: "right",
			curtainClass: "blueColour",
            scrollPadding: 150,
            scroll: true
		},
		{
            index: index++,
			type: "function",
			fn: 'demoFunction'
		},
        {
            index: index++,
            type: "element",
            selector: ".joyridecustom2",
            heading: "Basics (2)",
            text: "That team will automatically progress to the next stage.",
            placement: "right",
            curtainClass: "blueColour",
            scrollPadding: 70,
            scroll: true
        },
        {//5
            index: index++,
            type: "element",
            selector: ".teams",
            heading: "Basics (2)",
            text: "You will have to do this for all matchups. <br>That means you will have to predict future matchups as well - if you forecast correctly, you will receive bonus points",
            placement: "top",
            curtainClass: "blueColour",
            scrollPadding: 320,
            scroll: true
        },
        {
            index: index++,
            type: "function",
            fn: 'showPickCounterJoyride'
        },
        {
            index: index++,
            type: "element",
            selector: ".pickCounter",
            heading: "Basics (2)",
            text: "Pick until your bracket is complete - this number will tell you so",
            placement: "left",
            curtainClass: "blueColour",
            scrollPadding: 250,
            scroll: true

        },
        {
            index: index++,
            type: "function",
            fn: 'demoFunction2'
        },
        {//9
            index: index++,
            type: "element",
            selector: ".joyridecustom3",
            heading: "Basics (2)",
            text: "Here is a sample completed bracket.",
            placement: "left",
            curtainClass: "blueColour",
            scrollPadding: 70,
            scroll: true
        },
        {
            index: index++,
            type: "element",
            selector: makeJoyRideChampion(),
            heading: "Basics (2)",
            text: "[replaced]",
            placement: "left",
            curtainClass: "blueColour",
            scrollPadding: 170,
            scroll: true
        },
        {
            index: index++,
            type: "element",
            selector: "#region-1-winner",
            heading: "Basics (2)",
            text: "... appears in the championship round.",
            placement: "bottom",
            curtainClass: "blueColour",
            scrollPadding: 250,
            scroll: true
            },
        {
            index: index++,
            type: "element",
            selector: "#finals-match",
            heading: "Basics (2)",
            text: "[replaced]",
            placement: "bottom",
            curtainClass: "blueColour",
            scrollPadding: 250,
            scroll: true
        },
        {
            index: index++,
            type: "element",
            selector: "#champion",
            heading: "Basics (2)",
            text: "[replaced]",
            placement: "bottom",
            curtainClass: "blueColour",
            scrollPadding: 250,
            scroll: true
        },
        {//14
            index: index++,
            type: "element",
            selector: ".final-score",
            heading: "Basics (2)",
            text: "For the championship game, you have to forecast the final score. For reference, the final score last year was 60-54.",
            placement: "bottom",
            curtainClass: "blueColour",
            scrollPadding: 250,
            scroll: true
        },
        {
            index: index++,
            type: "element",
            selector: ".save-button",
            heading: "Basics (2)",
            text: "Remember to save your bracket!",
            placement: "bottom",
            curtainClass: "blueColour",
            scrollPadding: 250,
            scroll: true
        },{
            index: index++,
            type: "function",
            fn: 'demoFunction3'
        },
        {
            index: index++,
            type: "function",
            fn: 'showShuffleJoyride'
        },
        {//18
            index: index++,
            type: "element",
            selector: "#shuffle-button",
            heading: "Basics (2)",
            text: "I have cleared your bracket. If you are too lazy, you can click on this button to randomize the bracket, but be warned that you will probably not win many points.<br> Note that the randomizing keeps the teams you have already chosen.",
            placement: "bottom",
            curtainClass: "blueColour",
            scrollPadding: 250,
            scroll: true
        },
        {
            index: index++,
            type: "function",
            fn: 'showEraseJoyride'
        },
        {//20
            index: index++,
            type: "element",
            selector: "#clear-bracket-button",
            heading: "Basics (2)",
            text: "You can click this button to clear your bracket.",
            placement: "bottom",
            curtainClass: "blueColour",
            scrollPadding: 250,
            scroll: true
        },
        {
            index: index++,
            type: "function",
            fn: 'showColorsJoyride'
        },
        {
            index: index++,
            type: "element",
            selector: "#show-options-dropdown",
            heading: "Basics (2)",
            text: "Click this button to show icons relating to achievements. There are literally tens of ways to win achievements. Remember, whoever gets the most achievements wins money too!",
            placement: "bottom",
            curtainClass: "blueColour",
            scrollPadding: 250,
            scroll: true
        },{//23
            index: index++,
            type: "title",
            heading: "The End",
            text: 'That is it. Thank you for reading all these tips, have fun!',
            curtainClass: "championship-bracket"
        },

	];
    $scope.demoFunction = function(){
        $scope.moveTop(0,0,0,1, true)
    };
    $scope.demoFunction2 = function(){
        $scope.randomizePicks(true);
        $scope.config['10'].text = "Notice that the champion chosen in this region (" + $scope.getTeamName(0,0,0,0,1) + ")..."
        $scope.config['12'].text = "Note that " + $scope.getTeamName(4,0,0,0,2) +  " and " +  $scope.getTeamName(4,0,0,0,3) + " are forecast to be in the finals..."
        $scope.config['13'].text = "..., and "+  $scope.getTeamName(4,0,0,0,1) +" is forecast to win. You will receive massive points if this actually happens."

    };
    $scope.demoFunction3 = function(){
        $scope.clearBracket(true);

    };
    function makeJoyRideChampion(){
        return ".region-0-champ-in-region-round"
    }
	$rootScope.$on('start-tutorial', function(event, obj){
        $scope.start();
	});

    $scope.showPickCounterJoyride = function(){
        $scope.showPickCounter = true;
    };
    $scope.showShuffleJoyride = function(){
        $scope.showShuffle = true;
    };
    $scope.showEraseJoyride = function(){
        $scope.showErase = true;
    };
    $scope.showColorsJoyride = function(){
        $scope.showColors = true;
    };


	$scope.getFlags = function(){
		if(!$window.sessionStorage.userFlags){
			userInfoFactory.getFlags($window.sessionStorage.token, $window.sessionStorage.user).then(function(data) {
				$scope.skipped_bracket_page = data.data.skipped_bracket_page;
				if(!$scope.skipped_bracket_page){
					$scope.start();
				}
			});
		}
	};


	$scope.onFinish = function () {
		$scope.skipped_bracket_page = true;
		userInfoFactory.sendFlags($window.sessionStorage.token, $window.sessionStorage.user, 'skipped_bracket_page', true);

	};

}]).factory('bracketFactory', function($http, $q) {
	/** https://docs.angularjs.org/guide/providers **/
	var urlBase = '';
	var bracketFactory = {};

	bracketFactory.getSavedBracket = function(username) {
		var deferred = $q.defer();
		$http({
			url: '/savedBracket.json', method: "GET", params: {username: username}
		}).success(function(data){
			deferred.resolve(data);
		}).error(function(data){
            bracketFactory.getDefaultBracket().then(function(data){
                var default_bracket = data;
                deferred.resolve(default_bracket);
            });

		});

		return deferred.promise;
	};

	bracketFactory.getDefaultBracket = function() {
        var deferred = $q.defer();
		$http.get("/brackets.json").success(function(data){
            deferred.resolve(data);
        }).error(function(data){
          deferred.reject(data);
        });
        return deferred.promise;
	};

    bracketFactory.getOfficialBracket = function(username) {
        var deferred = $q.defer();
        $http({
            url: '/officialbracket.json', method: "GET", params: {username: username}
        }).success(function(data){
            deferred.resolve(data);
        }).error(function(){
            deferred.reject("No official bracket yet.")

        });

        return deferred.promise;
    };

    bracketFactory.getScoreboard = function(username) {
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


	bracketFactory.saveBracket = function(token, username, bracket) {
		console.log("SAVING?");

		return $http.post( '/savebracket', {username: username, token: token, bracket: bracket});
	};


	return bracketFactory;
});