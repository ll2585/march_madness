angular.module('BoxCtrlAngular', []).controller('BoxControllerAngular', ['$scope', '$http', function($scope, $http) {
	$scope.init = function(){
		$http.get("/boxes.json").success(function(data){
			$scope.json_data = data
			console.log(data);
			$scope.winning_team = $scope.json_data['winning_numbers'];
		}).error(function(){
			console.log("No data");
		});

	};
	$scope.tagline = 'The square root of life is pi!';
	$scope.init();

}]);