
angular.module('BoxCtrlAngular', []).controller('BoxControllerAngular', ['$scope', '$http', '$rootScope', '$window', function($scope, $http, $rootScope, $window) {
	$scope.winning_team = [1,2,3,4,5,6,7];
	$scope.init = function(){
		$http.get("/boxes.json").success(function(data){
			$scope.json_data = data
			$scope.winning_team = $scope.json_data['winning_numbers'];
			$scope.losing_team = $scope.json_data['losing_numbers'];
			$scope.players = $scope.json_data['users'];
            var found_first_instance = false;
            for(var i = 0; i < $scope.players.length; i++){
                if(found_first_instance){
                    break;
                }
                for(var j = 0; j < $scope.players[i].length; j++){
                    if($scope.players[i][j] == $scope.myName){
                        $scope.first_coords = [i,j];
                        found_first_instance = true;
                        break;
                    }
                }
            }
            var winning_num = ($scope.winning_team[5][$scope.first_coords[1]]);
            var losing_num = ($scope.losing_team[5][$scope.first_coords[0]]);
			$scope.loaded = true;
            $scope.config[4].text = "If the winning team has a score ending in " + winning_num + " (like 1"+winning_num+", 2"+winning_num+", 3"+winning_num+", 4"+winning_num+", etc.)"
			$scope.config[5].text = "And the losing team has a score ending in " + losing_num + " (like 1"+losing_num+", 2"+losing_num+", 3"+losing_num+", 4"+losing_num+", etc.) so the final score is something like 4"+winning_num + "-3" + losing_num
            $scope.start();
		}).error(function(){
			console.log("No data");
		});

	};
	$scope.tagline = "Don't get boxed in!";
	$scope.losing_label = "losing-label";
    $scope.myName = $window.sessionStorage.name;



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
    var index = 0;
	$scope.config = [

		{//0
            index: index++,
			type: "title",
			heading: "THE BOX",
			text: '<div class="row"><div id="title-text" class="col-md-12"><span class="main-text">Welcome to <strong>THE BOX</strong></span><br><span>Please click "Next" to learn how the box works, or click "Skip" if you already know.</span></div></div>',
			curtainClass: "championship-bracket"
		},
		{
            index: index++,
			type: "element",
			selector: ".the-box",
			heading: "Basics (1)",
			text: "This is the box. You can get points for every game, depending on the final score.",
			placement: "top",
			scrollPadding: 250,
			scroll: true
		},
		{//2
            index: index++,
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
            index: index++,
			type: "element",
			selector: "#losing-table",
			heading: "Basics (2)",
			text: "And the losing team is here.",
			placement: "right",
			curtainClass: "blueColour",
			scrollPadding: 70,
			scroll: true
		},
		{//4
            index: index++,
			type: "element",
			selector: ".joyridecustom1",
			heading: "Basics (2)",
			text: "[repl]",
			placement: "top",
			curtainClass: "blueColour",
			scrollPadding: 320,
			scroll: true
		},
		{
            index: index++,
			type: "element",
			selector: ".joyridecustom2",
			heading: "Basics (2)",
			text: "[repl]",
			placement: "left",
			curtainClass: "blueColour",
			scrollPadding: 250,
			scroll: true

		},
		{//6
            index: index++,
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
            index: index++,
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
            index: index++,
			type: "element",
			selector: ".joyridecustom4",
			heading: "Basics (2)",
			text: "The next round has a different set of numbers for you, with the winner's number here..",
			placement: "bottom",
			curtainClass: "blueColour",
			scrollPadding: 250,
			scroll: true
		},
        {
            index: index++,
            type: "element",
            selector: ".joyridecustom5",
            heading: "Basics (2)",
            text: "..and the loser's number here.",
            placement: "bottom",
            curtainClass: "blueColour",
            scrollPadding: 250,
            scroll: true
        },
		{//9
            index: index++,
			type: "title",
			heading: "The End",
			text: 'That is it. Thank you for reading all these tips, have fun!',
			curtainClass: "championship-bracket"
		},

	];
	$rootScope.$on('start-tutorial', function(event, obj){
		$scope.start();
	});

	$scope.doneWithTutorial = false;
	$scope.loaded = false;
	$scope.init();
}]).directive('centerMe', function($timeout, $window) {
    var drawMe = function(scope, element, attrs){
        $timeout(function () {
            $timeout(function () {
                var myDimens = element[0].getBoundingClientRect();
                var parent = angular.element( document.querySelector( '#' + attrs.myParent ) );

                var parentDimens = parent[0].getBoundingClientRect();
                var new_css = {
                    'position': 'absolute'
                };

                if(scope.vertical){
                    new_css['transform'] = 'rotate(-90deg)';
                    new_css['transform-origin'] = 'left top';
                    new_css['top'] = (parent[0].getBoundingClientRect().top + parent[0].getBoundingClientRect().height / 2 + 83/ 2) + "px";
                    new_css['left'] = (parent[0].getBoundingClientRect().left - 20 - scope.padding) + "px"; //hardcoded fuck you angular
                }else{
                    new_css['left'] = (parent[0].getBoundingClientRect().left + parent[0].getBoundingClientRect().width / 2 - 92/ 2) + "px";
                    new_css['top'] = (parent[0].getBoundingClientRect().top - 20- scope.padding) + "px";
                }

                element.css(new_css);

            }, 0);
        }, 0);
    };
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
					drawMe(scope, element, attrs);
				}
			});

            var w = angular.element($window);
            scope.getWindowDimensions = function () {
                return { 'h': w.height(), 'w': w.width() };
            };
            scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                drawMe(scope,element,attrs)
            },true)
            w.bind('resize', function () {
                scope.$apply();
            });

		}
	}
}).directive('drawLine', function($timeout, $window) {
    var drawMe = function(scope, element, attrs){
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
                var my_current_border = 8; //hard coded fuck yuo angular
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
	return {
		restrict: 'E',
		scope:{
			loaded: '='
		},
		link: function(scope,element,attrs){
			scope.$watch('loaded', function(newValue, oldValue) {
				if (newValue) {
					drawMe(scope,element,attrs)
				}
			})

            var w = angular.element($window);
            scope.getWindowDimensions = function () {
                return { 'h': w.height(), 'w': w.width() };
            };
            scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                drawMe(scope,element,attrs)
            },true)
            w.bind('resize', function () {
                scope.$apply();
            });
		}

	};

});