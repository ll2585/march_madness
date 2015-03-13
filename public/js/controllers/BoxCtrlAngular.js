
angular.module('BoxCtrlAngular', []).controller('BoxControllerAngular', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
	$scope.winning_team = [1,2,3,4,5,6,7];
	$scope.init = function(){
		$http.get("/boxes.json").success(function(data){
			$scope.json_data = data
			console.log(data);
			$scope.winning_team = $scope.json_data['winning_numbers'];
			$scope.losing_team = $scope.json_data['losing_numbers'];
			$scope.players = $scope.json_data['users'];
			$scope.loaded = true;
			$scope.start();
		}).error(function(){
			console.log("No data");
		});

	};
	$scope.tagline = 'The square root of life is pi!';
	$scope.losing_label = "losing-label";



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

		{//0
			type: "title",
			heading: "THE BOX",
			text: '<div class="row"><div id="title-text" class="col-md-12"><span class="main-text">Welcome to <strong>THE BOX</strong></span><br><span>Please click "Next" to learn how the box works, or click "Skip" if you already know.</span></div></div>',
			curtainClass: "championship-bracket"
		},
		{
			type: "element",
			selector: ".the-box",
			heading: "Basics (1)",
			text: "This is the box. You can get points for every game, depending on the final score.",
			placement: "top",
			scrollPadding: 250,
			scroll: true
		},
		{//2
			type: "element",
			selector: "#winning-cols",
			heading: "Basics (2)",
			text: "The winning team is here.",
			placement: "right",
			curtainClass: "blueColour",
			scrollPadding: 150,
			scroll: true
		},
		{
			type: "element",
			selector: "#losing-table",
			heading: "Basics (2)",
			text: "And the losing team is here.",
			placement: "right",
			curtainClass: "blueColour",
			scrollPadding: 70,
			scroll: true
		},
		{//5
			type: "element",
			selector: ".joyridecustom1",
			heading: "Basics (2)",
			text: "If the winning team has a score ending in 3 (like 13, 23, 33, 43, etc.)",
			placement: "top",
			curtainClass: "blueColour",
			scrollPadding: 320,
			scroll: true
		},
		{
			type: "element",
			selector: ".joyridecustom2",
			heading: "Basics (2)",
			text: "And the losing team has a score ending in 5 (like 15, 25, 35, 45, etc.) so the final score is something like 43-35,",
			placement: "left",
			curtainClass: "blueColour",
			scrollPadding: 250,
			scroll: true

		},
		{//9
			type: "element",
			selector: ".joyridecustom3",
			heading: "Basics (2)",
			text: "then you would win!",
			placement: "left",
			curtainClass: "blueColour",
			scrollPadding: 70,
			scroll: true
		},
		{
			type: "element",
			selector: ".joyridecustom1",
			heading: "Basics (2)",
			text: "This is for each game in the first round.",
			placement: "bottom",
			curtainClass: "blueColour",
			scrollPadding: 250,
			scroll: true
		},
		{
			type: "element",
			selector: ".joyridecustom4",
			heading: "Basics (2)",
			text: "The next round has a different set of numbers for you.",
			placement: "bottom",
			curtainClass: "blueColour",
			scrollPadding: 250,
			scroll: true
		},
		{
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
	$scope.loaded = false;
	$scope.init();
}]).directive('centerMe', function($timeout, $q) {
	return {
		restrict: 'E',
		scope:{
			loaded: '=',
			vertical: '=',
			padding: '='
		},
		link: function (scope, element, attrs) {
			scope.$watch('loaded', function(newValue, oldValue) {
				if(newValue){
					$timeout(function () {
						$timeout(function () {
							var myDimens = element[0].getBoundingClientRect();
							var parent = angular.element( document.querySelector( '#' + attrs.myParent ) );
							console.log(parent);
							var parentDimens = parent[0].getBoundingClientRect();
							var new_css = {
								'position': 'absolute'
							};
							console.log(parent[0].getBoundingClientRect());
							console.log(myDimens);
							if(scope.vertical){
								new_css['transform'] = 'rotate(-90deg)';
								new_css['transform-origin'] = 'left top';
								new_css['top'] = (parent[0].getBoundingClientRect().top + parent[0].getBoundingClientRect().height / 2 + myDimens.width/ 2) + "px";
								new_css['left'] = (parent[0].getBoundingClientRect().left - myDimens.height - scope.padding) + "px";
							}else{
								new_css['left'] = (parent[0].getBoundingClientRect().left + parent[0].getBoundingClientRect().width / 2 + myDimens.height/ 2) + "px";
								new_css['top'] = (parent[0].getBoundingClientRect().top - myDimens.height - scope.padding) + "px";
							}
							console.log(new_css);
							element.css(new_css);

						}, 0);
					}, 0);
				}
			});

		}
	}
}).directive('drawLine', function($timeout) {
	return {
		restrict: 'E',
		scope:{
			loaded: '='
		},
		link: function(scope,element,attrs){
			scope.$watch('loaded', function(newValue, oldValue) {
				if (newValue) {
					$timeout(function () {
						$timeout(function () {
							//only works if first is to top right of second; draws line from top left to top left
							var from_elem = angular.element(document.querySelector('#' + attrs.from));
							var to_elem = angular.element(document.querySelector('#' + attrs.to));
							var height_distance = from_elem[0].getBoundingClientRect().top - to_elem[0].getBoundingClientRect().top;
							var width_distance = from_elem[0].getBoundingClientRect().left - to_elem[0].getBoundingClientRect().left;
							var distance = Math.sqrt(
								Math.pow(height_distance, 2) +
								Math.pow(width_distance, 2)
							);
							var angle = Math.atan(height_distance / width_distance);
							var my_current_border = element[0].getBoundingClientRect().width;
							var required_padding = (distance - my_current_border) / 2;
							element.css({
								'top': to_elem[0].getBoundingClientRect().top + 'px',
								'left': to_elem[0].getBoundingClientRect().left + 'px',
								'border-top': '1px solid',
								'position': 'absolute',
								'padding-left': required_padding + 'px',
								'padding-right': required_padding + 'px',
								'transform': 'rotate(' + angle + 'rad)',
								'transform-origin': 'left top'
							});

						}, 0);
					}, 0);
				}
			})
		}

	};

});