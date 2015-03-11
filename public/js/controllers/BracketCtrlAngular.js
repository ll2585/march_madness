angular.module('BracketCtrlAngular', []).controller('BracketControllerAngular', ['$scope', '$rootScope', '$http', 'ModalService', 'bracketFactory','$window', '$modal', function($scope, $rootScope, $http, ModalService, bracketFactory, $window, $modal) {
	$scope.base_height = 20;

	$scope.loadBrackets = function(){
		bracketFactory.getSavedBracket($window.sessionStorage.user).then(function(data) {
			$scope.data = data;
			$scope.storeBracketAsSaved();

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
				}else if($scope.data[region]['tree'][top_node_id]['top'] == null && regionID != 4){
					$scope.removeFromTop(4,name,$scope.championship_map[region]); //remove from championship
					$scope.data["championship"]['tree'][$scope.championship_map[region]]['name'] = null;
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
					console.log($scope.data["championship"]['tree'][$scope.championship_map[region]]);
					if(regionID != 4){
						$scope.data["championship"]['tree'][$scope.championship_map[region]]['name'] = team_name; //0->4 1->6 2->5 3->7
					}
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
					top_node = $scope.data['championship']['tree'][$scope.championship_map[region]];
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
				if(regionID == 4 && team_id == 4){
					console.log(cur_team);
				}
				if(top_node_id==null && regionID != 4){
					top_node = $scope.data['championship']['tree'][$scope.championship_map[region]]
				}else if(top_node_id != null){
					top_node = $scope.data[region]['tree'][top_node_id];
				}else{
					return false;
				}

				var top_node_has_name = top_node['name'] != null;
				var top_node_does_not_have_my_name = top_node['name'] != cur_team['name'];

				return (i_have_name && top_node_does_not_have_my_name && top_node_has_name);
			}

			$scope.changedBracket = function(){
				return JSON.stringify($scope.savedBracket) !== JSON.stringify($scope.data);
			}

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
			}


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


	/**
	var myModal = $modal({title: 'Holy guacamole!', content: 'Best check yo self, you\'re not looking too good.', placement: 'top', type: 'info', keyboard: true, show: false});
	$scope.showModal = function() {
		myModal.$promise.then(myModal.show);
	};
		$scope.hideModal = function() {
		  myModal.$promise.then(myModal.hide);
		};
	$scope.showModal()

    ModalService.showModal({
        templateUrl: "template.html",
        controller: "ModalController"
    }).then(function(modal) {
        //it's a bootstrap element, use 'modal' to show it
        modal.element.modal();
        modal.close.then(function(result) {
            if(result){
                console.log($rootScope);

            }

            console.log(result);
        });
    });
	 **/

	var count = 0;
	$scope.startJoyRide = false;
	$scope.start = function () {
		if(count > 0){
			generateAlternateConfig();
		}
		count++;
		$scope.startJoyRide = true;

	}
//copy the references (you could clone ie angular.copy but then have to go through a dirty checking for the matches)
	$scope.displayedCollection = [].concat($scope.rowCollection);
	function generateAlternateConfig(){
		//This is to show that it can have dynamic configs which can change . The joyride would not need to be initialized again.
		$scope.config[2].text = "I can have dynamic text that can change in between joyrides"
	}
	$scope.config = [

		{
			type: "title",
			heading: "Welcome to the NG-Joyride demo",
			text: '<div class="row"><div id="title-text" class="col-md-12"><span class="main-text">Welcome to <strong>Ng Joyride Demo</strong></span><br><span>( This demo will walk you through the features of Ng-Joyride. )</span><br/><br/><span class="small"><em>This can have custom html too !!!</em></span></div></div>',
			curtainClass: "randomClass"

		},
		{
			type: "element",
			selector: ".jumbotron",
			heading: "Title can have <em>HTML</em>",
			text: "You are in the <em>home page.</em>",
			placement: "bottom",
			scroll: true
		},
		{
			type: "element",
			selector: ".container",
			heading: "Step 1",
			text: "I can come over any element.Even the background is customizable per step",
			placement: "bottom",
			curtainClass: "blueColour",
			scroll: true
		},
		{
			type: "element",
			selector: ".championship-bracket",
			heading: "Step 2",
			text: "I can change placement",
			placement: "right",
			scroll: true
		}
	];

	$rootScope.$on('start-tutorial', function(event, obj){
		alert("TUT")
	});

	$scope.startJoyRide = true;
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
			alert("NO SAVED");
			deferred.resolve(this.getDefaultBracket());
		});

		return deferred.promise;
	};

	bracketFactory.getDefaultBracket = function() {
		return $http.get("/brackets.json");
	};

	bracketFactory.saveBracket = function(token, username, bracket) {
		console.log("SAVING?");
		return $http.post( '/savebracket', {username: username, token: token, bracket: bracket});
	};


	return bracketFactory;
});;