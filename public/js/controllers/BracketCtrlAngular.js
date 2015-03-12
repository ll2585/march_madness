angular.module('BracketCtrlAngular', ['ui.bootstrap']).controller('BracketControllerAngular', ['$scope', '$rootScope', '$http', 'ModalService', 'bracketFactory','$window', '$modal', function($scope, $rootScope, $http, ModalService, bracketFactory, $window, $modal) {
	$scope.base_height = 20;
	$scope.round = function(x){
		return Math.round(x);
	}
	$scope.toggleColors = true;
	$scope.toggleMascots = true;
    $scope.completedPicks = 0;
    $scope.finalsPicked = false;
    $scope.showPickCounter = false;
    $scope.showShuffle = false;
    $scope.showErase = false;
    $scope.showColors = false;
	$scope.loadBrackets = function(){
		bracketFactory.getSavedBracket($window.sessionStorage.user).then(function(data) {
			$scope.data = data;
			$scope.storeBracketAsSaved();

			$scope.status = {
				isopen: false
			};

			$scope.toggled = function(open) {
				$log.log('Dropdown is now: ', open);
			};

			$scope.toggleDropdown = function($event) {
				$event.preventDefault();
				$event.stopPropagation();
				$scope.status.isopen = !$scope.status.isopen;
			};
			$scope.getTeamColor=function(regionID, round, matchup, team_num, team_id_given){
				var region = $scope.region_dict[regionID];
				var team_id = team_id_given !== undefined ? team_id_given : Math.pow(2,round) + (2*matchup) + (team_num-1);
				if($scope.data[region]['tree'][team_id] == undefined){
					console.log(round)
					console.log(matchup)
					console.log(team_num)
					console.log(team_id);
				}
				if($scope.data[region]['tree'][team_id]['team']==null){
					return null;
				}
				return ($scope.data[region]['tree'][team_id]['team']['color']);
			};
			$scope.getTeam=function(regionID, round, matchup, team_num, team_id_given){
				var region = $scope.region_dict[regionID];
				var team_id = team_id_given !== undefined ? team_id_given : Math.pow(2,round) + (2*matchup) + (team_num-1);
				if($scope.data[region]['tree'][team_id]['team']==null){
					return null;
				}
				return ($scope.data[region]['tree'][team_id]['team']);
			};
			$scope.getTeamName=function(regionID, round, matchup, team_num, team_id_given){
				var region = $scope.region_dict[regionID];
				var team_id = team_id_given !== undefined ? team_id_given : Math.pow(2,round) + (2*matchup) + (team_num-1);
                if($scope.data[region]['tree'][team_id]['team']==null){
                    return null;
                }
				return ($scope.data[region]['tree'][team_id]['team']['name']);
			};
            $scope.setTeam=function(region, round, matchup, team_num, team, team_id_given){
                var region = $scope.region_dict[region];
                var team_id = team_id_given !== undefined ? team_id_given : Math.pow(2,round) + (2*matchup) + (team_num-1);
                if($scope.data[region]['tree'][team_id]['team']==null){
                    $scope.data[region]['tree'][team_id]['team'] = {}
                }
                $scope.data[region]['tree'][team_id]['team'] = JSON.parse(JSON.stringify(team));
            };
			$scope.removeFromTop=function(regionID, name, top_node_id){
				var region = $scope.region_dict[regionID];
				if($scope.getTeamName(regionID, 0, 0,top_node_id) == name){
					$scope.data[region]['tree'][top_node_id]['team'] = null;
				}
				if($scope.data[region]['tree'][top_node_id]['top'] != null){
					$scope.removeFromTop(regionID, name, $scope.data[region]['tree'][top_node_id]['top']);
				}else if($scope.data[region]['tree'][top_node_id]['top'] == null && regionID != 4) {
                    $scope.removeFromTop(4, name, $scope.championship_map[region]); //remove from championship
                    if ($scope.getTeamName(4, 0, 0,$scope.championship_map[region]) == name) {
                        $scope.data["championship"]['tree'][$scope.championship_map[region]]['team'] = null;
                    }
				}
			};
			$scope.getChampion=function(regionID){
				var region = $scope.region_dict[regionID];
                return $scope.getTeamName(regionID, 0, 0,1);
			};
			$scope.getChampionColor=function(){
				return $scope.getTeamColor(4, 0, 0,1);
			};
			$scope.moveTop=function(regionID, round, matchup, team_num, forced){

                if(forced === undefined){
                    var iAmforced = false;
                }else{
                    var iAmforced = true;
                }
                if(!$scope.doneWithTutorial && !iAmforced){
                    return;
                }
				var region = $scope.region_dict[regionID];
				var team_id = Math.pow(2,round) + (2*matchup) + (team_num-1);
				var top_node_id = $scope.data[region]['tree'][team_id]['top'];
				var team = $scope.getTeam(regionID, 0, 0,team_id);
				var team_name = $scope.getTeamName(regionID, 0, 0,team_id);

				$scope.setTeam(regionID,0,0,top_node_id,team);
				var other_team_id = $scope.data[region]['tree'][top_node_id]['left'] == team_id ? $scope.data[region]['tree'][top_node_id]['right'] : $scope.data[region]['tree'][top_node_id]['left'];
				var other_team_name = $scope.getTeamName(regionID,0,0,other_team_id);
				if(other_team_name != null){
					$scope.removeFromTop(regionID, other_team_name, top_node_id);
				}

				if($scope.data[region]['tree'][top_node_id]['top']==null){ //champion
					if(regionID != 4){
						$scope.setTeam(4,0,0,$scope.championship_map[region],team); //0->4 1->6 2->5 3->7
					}
				}

			};
			$scope.canClick=function(regionID, round, matchup, team_num){
				var region = $scope.region_dict[regionID];
				var team_id = Math.pow(2,round) + (2*matchup) + (team_num-1);
				var cur_team = $scope.data[region]['tree'][team_id];
				var i_have_name = $scope.getTeamName(regionID,0,0,team_id) != null;
				var top_node_id = cur_team['top'];
				var top_node;
				if(top_node_id==null && regionID != 4){
					top_node = $scope.data['championship']['tree'][$scope.championship_map[region]];
				}else if(top_node_id != null){

					top_node = $scope.data[region]['tree'][top_node_id];
				}else{
					return false;
				}

				var no_top_selected =$scope.getTeamName(regionID,0,0,top_node_id) == null;
				var top_node_has_my_name = $scope.getTeamName(regionID,0,0,top_node_id) == $scope.getTeamName(regionID,0,0,team_id);
				return (i_have_name && no_top_selected) || (i_have_name && top_node_has_my_name);
			}
			$scope.choseToLose=function(regionID, round, matchup, team_num){
				var region = $scope.region_dict[regionID];
				var team_id = Math.pow(2,round) + (2*matchup) + (team_num-1);
				var cur_team = $scope.data[region]['tree'][team_id];
				var i_have_name = $scope.getTeamName(regionID,0,0,team_id) != null;
				var top_node_id = cur_team['top'];
				var top_node;
				if(top_node_id==null && regionID != 4){
					top_node = $scope.data['championship']['tree'][$scope.championship_map[region]]
				}else if(top_node_id != null){
					top_node = $scope.data[region]['tree'][top_node_id];
				}else{
					return false;
				}

				var top_node_has_name = $scope.getTeamName(regionID,0,0,top_node_id) != null;
				var top_node_does_not_have_my_name = $scope.getTeamName(regionID,0,0,top_node_id) != $scope.getTeamName(regionID,0,0,team_id);

				return (i_have_name && top_node_does_not_have_my_name && top_node_has_name);
			}

			$scope.changedBracket = function(){
				return JSON.stringify($scope.savedBracket) !== JSON.stringify($scope.data);
			};

			$scope.saveChanges = function(){
				var new_bracket = $scope.data;
				bracketFactory.saveBracket($window.sessionStorage.token, $window.sessionStorage.user, new_bracket).success(function() {
					alert("SAVED");
					$scope.storeBracketAsSaved();
				}).error(function(status, data) {
					console.log("SOERROR");
					console.log(status);
					console.log(data);
				});
			};

            $scope.clearBracket = function(){
                for (var k = 0; k < 4; k++) {
                    var region = $scope.region_dict[k];
                    for (var j = 16; j < 32; j++) {
                        var node = $scope.data[region]['tree'][j];
                        if ($scope.getTeamName(k,0,0,j) != null) {
                            var top_node_id = node['top'];

                            var team_name = $scope.getTeamName(k,0,0,j);

                            $scope.removeFromTop(k, team_name, top_node_id);
                        }
                    }
                }
            };

            $scope.randomizePicks = function(forced) {
                if(forced === undefined){
                    var iAmforced = false;
                }else{
                    var iAmforced = true;
                }
                if(!$scope.doneWithTutorial && !iAmforced){
                    return;
                }
                var round = 4;
                //go from 8 to 15, and then 4 to 7, and then 2 to 3 and then 1
                for (var k = 0; k < 4; k++) {
                    var region = $scope.region_dict[k];
                    for (var j = 3; j > -1; j--) {
                        for (var i = Math.pow(2, j); i < Math.pow(2, j + 1); i++) {
                            var node = $scope.data[region]['tree'][i];
                            if ($scope.getTeamName(k,0,0,i) == null) {
                                var new_node;
                                if ($window.Math.random() > 0.5) {
                                    new_node = 1;
                                } else {
                                    new_node = 2;
                                }
                                $scope.moveTop(k, j + 1, i - Math.pow(2, j), new_node, forced);

                            }
                        }
                    }
                }
                for (var j = 1; j > -1; j--) {
                    for (var i = Math.pow(2, j); i < Math.pow(2, j + 1); i++) {
                        var node = $scope.data['championship']['tree'][i];
                        if ($scope.getTeamName(4,0,0,i) == null) {
                            var new_node;
                            if ($window.Math.random() > 0.5) {
                                new_node = 1;
                            } else {
                                new_node = 2;
                            }
                            $scope.moveTop(4, j + 1, i - Math.pow(2, j), new_node, forced);

                        }
                    }
                }

            }

            $scope.pickCountTotal = function() {
                var picks = 0;
                var total_picks = 0;
                //go from 8 to 15, and then 4 to 7, and then 2 to 3 and then 1
                for (var k = 0; k < 4; k++) {
                    var region = $scope.region_dict[k];
                    for (var j = 3; j > -1; j--) {
                        for (var i = Math.pow(2, j); i < Math.pow(2, j + 1); i++) {
                            var node = $scope.data[region]['tree'][i];
                            total_picks += 1;
                            if ($scope.getTeamName(k,0,0,i) != null) {
                                picks += 1;
                            }
                        }
                    }
                }
                for (var j = 1; j > -1; j--) {
                    for (var i = Math.pow(2, j); i < Math.pow(2, j + 1); i++) {
                        var node = $scope.data['championship']['tree'][i];
                        total_picks += 1;
                        if ($scope.getTeamName(4,0,0,i) != null) {
                            picks += 1;
                        }
                    }
                }
                return {'Total Picks': total_picks, 'Completed Picks': picks};
            };



            $scope.finalsPicked = ($scope.getTeamName(4, 1, 0, 1) != null && $scope.getTeamName(4, 1, 0, 2) != null )



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

    $scope.onFinish = function(){
        $scope.doneWithTutorial = true;
    }

	$scope.startJoyRide = false;
	$scope.start = function () {
        $scope.showShuffle = false;
        $scope.showErase = false;
        $scope.showColors = false;
        $scope.doneWithTutorial = false;
        $scope.showPickCounter = false;
		$scope.startJoyRide = true;

	}
	$scope.config = [

		{
			type: "title",
			heading: "THE BRACKET",
			text: '<div class="row"><div id="title-text" class="col-md-12"><span class="main-text">Welcome to <strong>THE BRACKET</strong></span><br><span>Please click "Next" to learn how to make picks, or click "Skip" if you already know.</span></div></div>',
			curtainClass: "championship-bracket"
		},
		{
			type: "element",
			selector: ".teams",
			heading: "Basics (1)",
			text: "These are the teams in the tournament.",
			placement: "top",
            scrollPadding: 250,
            scroll: true
		},
		{
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
			type: "function",
			fn: 'demoFunction'
		},
        {
            type: "element",
            selector: ".joyridecustom2",
            heading: "Basics (2)",
            text: "That team will automatically progress to the next stage.",
            placement: "right",
            curtainClass: "blueColour",
            scrollPadding: 70,
            scroll: true
        },
        {
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
            type: "function",
            fn: 'showPickCounterJoyride'
        },
        {
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
            type: "function",
            fn: 'demoFunction2'
        },
        {
            type: "element",
            selector: ".joyridecustom3",
            heading: "Basics (2)",
            text: "Here is a sample completed bracket. Notice that the champion chosen in this region...",
            placement: "left",
            curtainClass: "blueColour",
            scrollPadding: 70,
            scroll: true
        },
        {
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
            type: "element",
            selector: "#finals-match",
            heading: "Basics (2)",
            text: "Note that these two teams are forecast to be in the finals...",
            placement: "bottom",
            curtainClass: "blueColour",
            scrollPadding: 250,
            scroll: true
        },
        {
            type: "element",
            selector: "#champion",
            heading: "Basics (2)",
            text: "..., and this team is forecast to win. You will receive massive points if this actually happens.",
            placement: "bottom",
            curtainClass: "blueColour",
            scrollPadding: 250,
            scroll: true
        },
        {
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
            type: "element",
            selector: ".save-button",
            heading: "Basics (2)",
            text: "Remember to save your bracket!",
            placement: "bottom",
            curtainClass: "blueColour",
            scrollPadding: 250,
            scroll: true
        },{
            type: "function",
            fn: 'demoFunction3'
        },
        {
            type: "function",
            fn: 'showShuffleJoyride'
        },
        {
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
            type: "function",
            fn: 'showEraseJoyride'
        },
        {
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
            type: "function",
            fn: 'showColorsJoyride'
        },
        {
            type: "element",
            selector: "#show-options-dropdown",
            heading: "Basics (2)",
            text: "Click this button to show icons relating to achievements. There are literally tens of ways to win achievements. Remember, whoever gets the most achievements wins money too!",
            placement: "bottom",
            curtainClass: "blueColour",
            scrollPadding: 250,
            scroll: true
        },{
            type: "title",
            heading: "The End",
            text: 'That is it. Thank you for reading all these tips, have fun!',
            curtainClass: "championship-bracket"
        },

	];
    $scope.demoFunction = function(){
        $scope.moveTop(0,4,0,1, true)
    };
    $scope.demoFunction2 = function(){
        $scope.randomizePicks(true);

    };
    $scope.demoFunction3 = function(){
        $scope.clearBracket();

    };
	$rootScope.$on('start-tutorial', function(event, obj){
        $scope.start();
	});

    $scope.doneWithTutorial = false;
    $scope.showPickCounterJoyride = function(){
        $scope.showPickCounter = true;
    }
    $scope.showShuffleJoyride = function(){
        $scope.showShuffle = true;
    }
    $scope.showEraseJoyride = function(){
        $scope.showErase = true;
    }
    $scope.showColorsJoyride = function(){
        $scope.showColors = true;
    }
	$scope.start();

}]).controller('ModalController', function($scope, close) {

    $scope.close = function(result) {
        close(result, 500); // close, but give 500ms for bootstrap to animate
    };

}).factory('bracketFactory', function($http, $q) {
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

	bracketFactory.saveBracket = function(token, username, bracket) {
		console.log("SAVING?");
		return $http.post( '/savebracket', {username: username, token: token, bracket: bracket});
	};


	return bracketFactory;
});