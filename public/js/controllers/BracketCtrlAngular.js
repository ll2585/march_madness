angular.module('BracketCtrlAngular', []).controller('BracketControllerAngular', ['$scope', '$rootScope', '$http', 'ModalService', function($scope, $rootScope, $http, ModalService) {
	$scope.base_height = 20;
	$http.get("/brackets.json").success(function(data){
		$scope.data = data;
	}).error(function(){
		console.log("No data");
	});

    console.log($rootScope);

	$scope.region_dict = {
		"0": "west",
		"1": "east",
		"2": "south",
		"3": "north",
		"4": "championship"
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

	$scope.getTeamName=function(region, round, matchup, team_num){
		var region = $scope.region_dict[region];
		var team_id = Math.pow(2,round) + (2*matchup) + (team_num-1);
		return ($scope.data[region]['tree'][team_id]['name']);
	};
	$scope.removeFromTop=function(regionID, name, top_node_id){
		var region = $scope.region_dict[regionID];
		if($scope.data[region]['tree'][top_node_id]['name'] == name){
			$scope.data[region]['tree'][top_node_id]['name'] = null;
		}
		if($scope.data[region]['tree'][top_node_id]['top'] != null){
			$scope.removeFromTop(regionID, name, $scope.data[region]['tree'][top_node_id]['top']);
		}else{
			$scope.removeFromTop(4,name,regionID+4); //remove from championship
			$scope.data["championship"]['tree'][regionID+4]['name'] = null;
		}
	};
	$scope.getChampion=function(regionID){
		var region = $scope.region_dict[regionID];
		return $scope.data[region]['tree']['1']['name'];
	};
	$scope.moveTop=function(regionID, round, matchup, team_num){
		var region = $scope.region_dict[regionID];
		var team_id = Math.pow(2,round) + (2*matchup) + (team_num-1);
		var top_node_id = $scope.data[region]['tree'][team_id]['top'];
		var team_name = $scope.data[region]['tree'][team_id]['name'];
		$scope.data[region]['tree'][top_node_id]['name'] = team_name;
		var other_team_id = $scope.data[region]['tree'][top_node_id]['left'] == team_id ? $scope.data[region]['tree'][top_node_id]['right'] : $scope.data[region]['tree'][top_node_id]['left'];
		console.log(top_node_id);
		var other_team_name = $scope.data[region]['tree'][other_team_id]['name'];
		if(other_team_name != null){
			$scope.removeFromTop(regionID, other_team_name, top_node_id);
		}

		if($scope.data[region]['tree'][top_node_id]['top']==null){ //champion
			console.log("CHAMPION");
			console.log($scope.data["championship"]['tree'][regionID+4]);
			$scope.data["championship"]['tree'][regionID+4]['name'] = team_name;
		}

	};
	$scope.canClick=function(regionID, round, matchup, team_num){
		var region = $scope.region_dict[regionID];
		var team_id = Math.pow(2,round) + (2*matchup) + (team_num-1);
		var cur_team = $scope.data[region]['tree'][team_id];
		var i_have_name = cur_team['name'] != null;
		var top_node_id = cur_team['top'];
		var top_node;
		if(top_node_id==null && regionID != 4){
			top_node = $scope.data['championship']['tree'][regionID+4];
		}else if(top_node_id != null){

			 top_node = $scope.data[region]['tree'][top_node_id];
		}else{
			return false;
		}

		var no_top_selected = top_node['name'] == null;
		var top_node_has_my_name = top_node['name'] == cur_team['name'];
		return (i_have_name && no_top_selected) || (i_have_name && top_node_has_my_name);
	}
	$scope.choseToLose=function(regionID, round, matchup, team_num){
		var region = $scope.region_dict[regionID];
		var team_id = Math.pow(2,round) + (2*matchup) + (team_num-1);
		var cur_team = $scope.data[region]['tree'][team_id];
		var i_have_name = cur_team['name'] != null;
		var top_node_id = cur_team['top'];
		var top_node;
		if(top_node_id==null && regionID != 4){
			top_node = $scope.data['championship']['tree'][regionID+4]
		}else if(top_node_id != null){
			top_node = $scope.data[region]['tree'][top_node_id];
		}else{
			return false;
		}
		var top_node_has_name = top_node['name'] != null;
		var top_node_does_not_have_my_name = top_node['name'] != cur_team['name'];
		return (i_have_name && top_node_does_not_have_my_name && top_node_has_name);
	}

	$scope.onboardingSteps = [
		{
			title: "Welcome!",
			position: "centered",
			description: "Welcome to my app!",
			width: 300
		},
		{
			title: "Account Setup",
			position: "right",
			description: "This is the form for configuring your account.",
			attachTo: "#account_form",
			position: "bottom"
		}
	];


    ModalService.showModal({
        templateUrl: "template.html",
        controller: "ModalController"
    }).then(function(modal) {
        //it's a bootstrap element, use 'modal' to show it
        modal.element.modal();
        modal.close.then(function(result) {
            if(result){
                console.log($rootScope);
                $rootScope.$on('start-tour', function(event, obj){
                    obj.tour.restart();
                });
            }

            console.log(result);
        });
    });

}]).controller('ModalController', function($scope, close) {

    $scope.close = function(result) {
        close(result, 500); // close, but give 500ms for bootstrap to animate
    };

});