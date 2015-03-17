angular.module('SideBarCtrl',  ['ui.bootstrap', 'bracketApp']).controller('SideBarController', ['$scope',  '$window','UserService', 'AuthenticationService', '$rootScope','$q', '$http', '$sce', function($scope, $window, UserService, AuthenticationService, $rootScope, $q, $http, $sce) {
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
    $scope.username = $window.sessionStorage.name
    $scope.collapse = true;
	$scope.isCollapsed = true;
	$scope.name = true;
	$scope.tabs = [
		{ link : '/bracket-angular', label : 'Bracket', class: 'icon-bracket', alignTo: 'bracket', myColor: "red" },
		{ link : '/box-angular', label : 'Box', class: 'icon-boxes', alignTo: 'box', myColor: "blue" },
		{ link : '/achievements', label : 'Achievements', class:'fa fa-trophy', alignTo: 'achievements', myColor: "green" }
	];



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


    $scope.getScoreboard = function(username) {
        var deferred = $q.defer();
        $http({
            url: '/scoreboard.json', method: "GET", params: {username: username}
        }).success(function(data){
            deferred.resolve(data);
        }).error(function(){
            deferred.reject("No official bracket yet.")
        });
        return deferred.promise;
    };
    $scope.getScoreboard($window.sessionStorage.user).then(function(data){
        $scope.scoreboard = [];
        var sorted_keys = Object.keys(data).sort(function(a,b){return data[b]-data[a]})
        for(var i = 0; i < sorted_keys.length; i++){
            var name = sorted_keys[i]
            var score = data[name]
            $scope.scoreboard.push({rank: i+1, name: name, score: score, achievements: 0})
        }
        $scope.getBracketStandings = function(){
            return "Your Total Score: " + data[$scope.username]['Total Score']
        }
        console.log(data)
        $scope.getMiniScoreboard = function(i){
            if(i >= $scope.scoreboard.length) return
            var user = $scope.scoreboard[i-1]
            return "(" + i + ") " + user.name + ": " + user.score["Total Score"]
        }

    });
        if(!$scope.brackets_opened){
            $http({
                url: '/boxes_scoreboard.json', method: "GET", params: {username: $window.sessionStorage.user}
            }).success(function(data){
                $scope.box_scoreboard=  data;
                $scope.box_scoreboard_by_round = [];
                for(var u in $scope.box_scoreboard){
                    for(var i = 0; i < $scope.box_scoreboard[u].length; i++){
                        var temp = {};
                        var this_game = $scope.box_scoreboard[u][i]
                        temp['round'] = this_game.round;
                        temp['winning_team'] = this_game.winning_team;
                        temp['winning_score'] = this_game.winning_score;
                        temp['losing_team'] = this_game.losing_team;
                        temp['losing_score'] = this_game.losing_score;
                        temp['player'] = u
                        $scope.box_scoreboard_by_round.push(temp);
                    }
                }
                console.log($scope.box_scoreboard_by_round)
            });
        }

    $http.get('/is_bracket_opened.json').success(function(data){
        console.log("IS B OP")
        $scope.brackets_opened = data['result']
        console.log(data);
    }).error(function(data){
        console.log(data);
    });

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
				element.css("content", "RED");
				element.css("font-size", "large");

			}
		}
	});