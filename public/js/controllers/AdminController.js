angular.module('AdminController',  []).controller('AdminController', ['$scope',  '$window','$rootScope', '$http', function($scope, $window, $rootScope, $http) {
	$scope.Math = window.Math;
    $scope.hi = "HI LUKE YOU ARE THE BEST"

    $scope.init = function(){
		$http.get('/admin/getAllSettings').success(function(data){
			$scope.settings = data;
			$scope.brackets_opened = data['brackets_opened']
			$scope.officialBracket = data['officialBracket']
			$scope.region = 'mid_west';
			console.log($scope.officialBracket['mid_west']['tree']);
			$scope.levels = function(region) {
				return $scope.getLevels(Object.keys($scope.officialBracket[region]['tree']).length);
			};

			$scope.getTeam = function(region, index) {
				return $scope.officialBracket[region]['tree'][index];
			};
			$scope.getTeamName = function(region, level, matchup, first) {
				var index = Math.pow(2, level) - 1 + 2*matchup + first;
				return $scope.getTeam(region, index);
			};
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