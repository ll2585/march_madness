angular.module('BoxCtrlAngular', []).controller('BoxControllerAngular', ['$scope', '$http', function($scope, $http) {
	$scope.init = function(){
		$http.get("/boxes.json").success(function(data){
			$scope.json_data = data
			console.log(data);
			$scope.winning_team = $scope.json_data['winning_numbers'];
			$scope.losing_team = $scope.json_data['losing_numbers'];
			$scope.players = $scope.json_data['users'];
		}).error(function(){
			console.log("No data");
		});

	};
	$scope.tagline = 'The square root of life is pi!';
	$scope.init();

}]).directive('rotateMe', function($timeout) {
	return {
		restrict: 'E',
		link: function (scope, element, attrs) {
			$timeout(function () {
				$timeout(function () {
					var myDimens = element[0].getBoundingClientRect();
					var parent = angular.element(document.querySelector('#' + attrs.myParent));
					var parentDimens = parent[0].getBoundingClientRect();
					var myNewHeight = myDimens.height;
					element.css({
						'top': parent[0].getBoundingClientRect().top + parent[0].getBoundingClientRect().height / 2 + myNewHeight / 2 + "px",
						'position': 'absolute',
						'transform': 'rotate(-90deg)',
						'transform-origin': 'left top'
					});
				}, 0);
			}, 0);
		}
	}
}).directive('drawLine', function($timeout) {
	return {
		restrict: 'E',
		controller: function($scope) {

		},
		link: function(scope,element,attrs){

			$timeout(function () {
				$timeout(function () {
			//only works if first is to top right of second; draws line from top left to top left
			var from_elem = angular.element( document.querySelector( '#' + attrs.from ) );
			var to_elem = angular.element( document.querySelector( '#' + attrs.to ) );
			var height_distance = from_elem[0].getBoundingClientRect().top-to_elem[0].getBoundingClientRect().top;
			var width_distance = from_elem[0].getBoundingClientRect().left-to_elem[0].getBoundingClientRect().left;
			var distance = Math.sqrt(
				Math.pow(height_distance,2)+
				Math.pow(width_distance,2)
			);
			var angle = Math.atan(height_distance/width_distance);
			var my_current_border = element[0].getBoundingClientRect().width;
			var required_padding = (distance - my_current_border)/2;
			element.css({
				'top':to_elem[0].getBoundingClientRect().top + 'px',
				'left':to_elem[0].getBoundingClientRect().left + 'px',
				'border-top': '1px solid',
				'position': 'absolute',
				'padding-left': required_padding + 'px',
				'padding-right': required_padding + 'px',
				'transform': 'rotate(' + angle + 'rad)',
				'transform-origin': 'left top'
			});
			console.log(to_elem[0].offsetTop);
			//element.text(required_padding);
				}, 0);
			}, 0);
		}

	};

});