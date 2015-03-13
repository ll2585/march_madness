angular.module('SideBarCtrl',  ['ui.bootstrap', 'bracketApp']).controller('SideBarController', ['$scope',  '$window','UserService', 'AuthenticationService', '$rootScope', function($scope, $window, UserService, AuthenticationService, $rootScope) {
    if($window.sessionStorage.token){
        AuthenticationService.isAuthenticated = true;
    }else{
        AuthenticationService.isAuthenticated = false;
    }
    $scope.isLoggedIn = AuthenticationService.isAuthenticated;
    $scope.$watch(function(){
        return AuthenticationService.isAuthenticated;
    }, function (newVal, oldVal) {
        $scope.isLoggedIn = AuthenticationService.isAuthenticated;
    });
    $scope.collapse = true;
	$scope.isCollapsed = true;
	$scope.name = true;
	$scope.tabs = [
		{ link : '/bracket-angular', label : 'Bracket', class: 'icon-bracket', alignTo: 'bracket', myColor: "red" },
		{ link : '/box-angular', label : 'Box', class: 'icon-boxes', alignTo: 'box', myColor: "blue" },
		{ link : '/minigame', label : 'MiniGame', class:'glyphicon glyphicon-user', alignTo: 'minigame', myColor: "green" },
		{ link : '/achievements', label : 'Achievements', class:'glyphicon glyphicon-cup', alignTo: 'achievements', myColor: "green" }
	];

	$scope.selectedTab = $scope.tabs[0];
	$scope.setSelectedTab = function(tab) {
		$scope.selectedTab = tab;
	}

	$scope.tabClass = function(tab) {
		if ($scope.selectedTab == tab) {
			return "active";
		} else {
			return "";
		}
	}

	$scope.user = {

		diameter: 200,

		style:{}

	};

	$scope.calcStyle = function(user){

		user.style = {'width':user.diameter+'px','height':user.diameter+'px'}

	};

	$scope.style = function(user) {

		return user.style;

	}


}])
    .directive('collapseWidth', ['$transition', function ($transition, $timeout) {

        return {
            link: function (scope, element, attrs) {

                var initialAnimSkip = true;
                var currentTransition;

                function doTransition(change) {
                    var newTransition = $transition(element, change);
                    if (currentTransition) {
                        currentTransition.cancel();
                    }
                    currentTransition = newTransition;
                    newTransition.then(newTransitionDone, newTransitionDone);
                    return newTransition;

                    function newTransitionDone() {
                        // Make sure it's this transition, otherwise, leave it alone.
                        if (currentTransition === newTransition) {
                            currentTransition = undefined;
                        }
                    }
                }

                function expand() {
                    if (initialAnimSkip) {
                        initialAnimSkip = false;
                        expandDone();
                    } else {
                        element.removeClass('collapse custom-collapsed').addClass('collapsing-width');
                        doTransition({ width: element[0].scrollWidth + 'px' }).then(expandDone);
                    }
                }

                function expandDone() {
                    element.removeClass('collapsing-width');
                    element.addClass('collapse in');
                    element.css({width: 'auto'});
                }

                function collapse() {
                    if (initialAnimSkip) {
                        initialAnimSkip = false;
                        collapseDone();
                        element.css({width: 0});
                    } else {
                        // CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
                        element.css({ width: element[0].scrollWidth + 'px' });
                        //trigger reflow so a browser realizes that height was updated from auto to a specific value
                        var x = element[0].offsetHeight;

                        element.removeClass('collapse in').addClass('collapsing-width');

                        doTransition({ width: 0 }).then(collapseDone);
                    }
                }

                function collapseDone() {
                    element.removeClass('collapsing-width');
                    element.addClass('collapse custom-collapsed');
                }

                scope.$watch(attrs.collapseWidth, function (shouldCollapse) {
                    if (shouldCollapse) {
                        collapse();
                    } else {
                        expand();
                    }
                });
            }
        };
    }])
	.directive('outerTab', function() {

		return {
			link: function (scope, element, attrs) {
				var col = attrs.makeColor;
				var attach = angular.element( document.querySelector( '#' + attrs.alignTo ) );
				//console.log(element);
				var new_left = attach[0].offsetLeft;
				var new_top = attach[0].offsetTop-element[0].offsetParent.offsetTop-element[0].offsetParent.offsetParent.offsetTop ;
				//console.log(new_top);
				if(col == 'red'){
					col_hex = "#00ff00"
				}else if(col == 'blue'){
					col_hex = '#0000ff'
				}else{
					col_hex = '#ff0000'
				}
				element.css("position", "absolute");
				element.css("left", 0);
				element.css("top", new_top);
				element.css("background-color", col_hex);
				element.css("content", "RED");
				element.css("font-size", "large");

			}
		}
	});