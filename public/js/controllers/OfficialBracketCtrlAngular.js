angular.module('OfficialBracketCtrlAngular', ['ui.bootstrap']).controller('OfficialBracketControllerAngular', ['$scope', '$rootScope', '$http', 'officialBracketFactory','$window', 'userInfoFactory', function($scope, $rootScope, $http, officialBracketFactory, $window, userInfoFactory) {
	$scope.base_height = 20;
    $scope.setUsername = function(n){
        $scope.username = n == undefined ? $window.localStorage.user :  n;
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
        officialBracketFactory.getEveryonesPicks($window.localStorage.user).then(function (data) {
            $scope.allBrackets = data;
            officialBracketFactory.getOfficialBracket($window.localStorage.user).then(function (data) {
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

                $scope.getScore = function (regionID, round, matchup, team_num, team_id_given) {
                    var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
                    var region = $scope.region_dict[regionID];
                    var node = $scope.officialBracket[region]['tree'][team_id];
                    if (node.team == null) return null;
                    return node.score
                };

                $scope.getEveryonesPicks = function(regionID, round, matchup, team_num, team_id_given) {
                    function getTheirTeamName(obj, region, team_id){
                        if(obj.bracket !== false){
                            var their_bracket = obj.bracket;
                            if(their_bracket[region]['tree'][team_id]['team'] !== false){
                                var name = their_bracket[region]['tree'][team_id]['team']['name']
                                return name;
                            }
                        }
                        return null;
                    }
                    var team_id = team_id_given !== undefined ? team_id_given : $scope.getTeamID(regionID, round, matchup, team_num);
                    var region = $scope.region_dict[regionID];
                    var result = [];
                    var team_picked = ''
                    for(var i = 0 ;i < $scope.allBrackets.length; i++){
                        var elimmed = false;
                        var right_pick = false;
                        var incorrect_pick = false;
                        var officialName = $scope.getOfficialTeamName(regionID, round, matchup, team_num, team_id_given);
                        var their_name = getTheirTeamName($scope.allBrackets[i], region, team_id);
                        right_pick = officialName == their_name
                        incorrect_pick = officialName !== null && their_name !== officialName
                        if(their_name in $scope.eliminatedTeams){
                            elimmed = true;
                        }
                        result.push("<span class = '" + (right_pick ? "correct-team" : incorrect_pick ? "incorrect-team" : elimmed ? "incorrect-team" : "") + "'>" + $scope.allBrackets[i]['name'] + ": " + their_name + "</span>");
                    }
                    return result.join("<BR>");
                }

                $scope.eliminatedTeams = {};
                var official = data;
                for(var region in official) {
                    for (var team_id in official[region]['tree']) {
                        var node = official[region]['tree'][team_id];
                        if (node.team !== null && node.left !== null) {
                            var this_team_name = node.team.name;
                            var left_team_name = official[region]['tree'][node.left].team.name
                            var right_team_name = official[region]['tree'][node.right].team.name
                            if(left_team_name !== this_team_name){
                                if(!(left_team_name in $scope.eliminatedTeams)){
                                    $scope.eliminatedTeams[left_team_name] = node.left; //their last seed
                                }
                            }
                            if(right_team_name !== this_team_name){
                                if(!(right_team_name in $scope.eliminatedTeams)){
                                    $scope.eliminatedTeams[right_team_name] = node.right; //their last seed
                                }
                            }
                        }
                    }
                }


            }, function (error) {
                console.log(error);
            });
        });



    };

	$scope.loadBrackets();

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


}]).factory('officialBracketFactory', function($http, $q) {
	/** https://docs.angularjs.org/guide/providers **/
	var urlBase = '';
	var officialBracketFactory = {};

    officialBracketFactory.getOfficialBracket = function(username) {
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

    officialBracketFactory.getEveryonesPicks = function(username) {
        var deferred = $q.defer();
        $http({
            url: '/everyonesbrackets.json', method: "GET", params: {username: username}
        }).success(function(data){
            deferred.resolve(data);
        }).error(function(){
            deferred.reject("No official bracket yet.")

        });

        return deferred.promise;
    };
	return officialBracketFactory;
});