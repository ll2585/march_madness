angular.module('BracketCtrlAngular', []).controller('BracketControllerAngular', ['$scope', '$http', function($scope, $http) {
	$scope.base_height = 20;
	$http.get("/brackets.json").success(function(data){
		$scope.data = data;
	}).error(function(){
		console.log("No data");
	});

	$scope.matchupCount=function(n){
		return new Array(8/Math.pow(2,n));
	};

	$scope.getNewHeight=function(i){
		return $scope.base_height*(Math.pow(2,i));
	};

	$scope.getTeamName=function(round, matchup, team_num){
		var team_id = Math.pow(2,round) + (2*matchup) + (team_num-1);
		return ($scope.data['west']['tree'][team_id]['name']);
	};
	$scope.moveTop=function(round, matchup, team_num){
		var team_id = Math.pow(2,round) + (2*matchup) + (team_num-1);
		var top_node = $scope.data['west']['tree'][team_id]['top'];
		var team_name = $scope.data['west']['tree'][team_id]['name'];
		$scope.data['west']['tree'][top_node]['name'] = team_name;
		var other_team_id = top_node['left'] == team_id ? top_node['right'] : top_node['left'];
		$scope.removeFromTop(other_team_id);
	};
	$scope.canClick=function(round, matchup, team_num){
		var team_id = Math.pow(2,round) + (2*matchup) + (team_num-1);
		var cur_team = $scope.data['west']['tree'][team_id];
		var i_have_name = cur_team['name'] != null;
		var top_node_id = cur_team['top'];
		var top_node = $scope.data['west']['tree'][top_node_id];
		var no_top_selected = top_node['name'] == null;
		var top_node_has_my_name = top_node['name'] == cur_team['name'];
		return (i_have_name && no_top_selected) || (i_have_name && top_node_has_my_name);
	}
	$scope.choseToLose=function(round, matchup, team_num){
		var team_id = Math.pow(2,round) + (2*matchup) + (team_num-1);
		var cur_team = $scope.data['west']['tree'][team_id];
		var i_have_name = cur_team['name'] != null;
		var top_node_id = cur_team['top'];
		var top_node = $scope.data['west']['tree'][top_node_id];
		var top_node_has_name = top_node['name'] != null;
		var top_node_does_not_have_my_name = top_node['name'] != cur_team['name'];
		return (i_have_name && top_node_does_not_have_my_name && top_node_has_name);
	}
}]);