angular.module('SideBarCtrl',  ['ui.bootstrap']).controller('SideBarController', ['$scope',  '$cookieStore', function($scope, $cookieStore) {
    $scope.name = 'World';
    $scope.collapse = false;

	$scope.tabs = [
		{ link : '/bracket', label : 'Bracket', class: 'glyphicon glyphicon-tasks' },
		{ link : '/box', label : 'Box', class: 'glyphicon glyphicon-th' },
		{ link : '/minigame', label : 'MiniGame', class:'glyphicon glyphicon-user' }
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

		style:{},

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
                        element.removeClass('partial_collapse').addClass('collapsing-width');
                        doTransition({ width: element[0].scrollWidth + 100+ 'px' }).then(expandDone);
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
                        element.css({width: 100+ 'px'});
                    } else {
                        // CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
                        element.css({ width: element[0].scrollWidth + 'px' });
                        //trigger reflow so a browser realizes that height was updated from auto to a specific value
                        var x = element[0].offsetHeight;

                        element.removeClass('collapse in').addClass('collapsing-width');

                        doTransition({ width: 100+ 'px' }).then(collapseDone);
                    }
                }

                function collapseDone() {
                    element.removeClass('collapsing-width');
                    element.addClass('partial-collapse');
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
    }]);