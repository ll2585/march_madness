angular.module('SideBarCtrl',  ['ui.bootstrap', 'bracketApp']).controller('SideBarController', ['$scope',  '$window','UserService', 'AuthenticationService', '$rootScope','$q', '$http', '$sce', function($scope, $window, UserService, AuthenticationService, $rootScope, $q, $http, $sce) {
    if($window.localStorage.token){
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
    $scope.username = $window.localStorage.user
    $scope.collapse = true;
	$scope.isCollapsed = true;
	$scope.name = true;
	$scope.tabs = [
		{ link : '/bracket-angular', label : 'Bracket', class: 'icon-bracket', alignTo: 'bracket', myColor: "red" },
		{ link : '/box-angular', label : 'Box', class: 'icon-boxes', alignTo: 'box', myColor: "blue" },
		{ link : '/achievements', label : 'Achievements', class:'fa fa-trophy', alignTo: 'achievements', myColor: "green" }
	];

    $scope.$watch('isCollapsed', function (shouldCollapse) {
        if (!shouldCollapse) {
            console.log("COLLAPSED FROM CTRL")
            $scope.refreshScoreboard();
        }
    });

    $scope.refreshScoreboard = function(){
        $scope.username = $window.localStorage.user

        $scope.getScoreboard($window.localStorage.user).then(function(data){
            $scope.scoreboard = [];
            var sb = data;
            for(var s in sb){
                $scope.scoreboard.push({name: s, round_score: sb[s]["Round Score"], score: sb[s]["Total Score"], achievements: sb[s]["Achievements"]})
            }
            var sort_by = function() {
                var fields = [].slice.call(arguments),
                    n_fields = fields.length;

                return function(A, B) {
                    var a, b, field, key, primer, reverse, result;
                    for (var i = 0, l = n_fields; i < l; i++) {
                        result = 0;
                        field = fields[i];

                        key = typeof field === 'string' ? field : field.name;

                        a = A[key];
                        b = B[key];

                        if (typeof field.primer !== 'undefined') {
                            a = field.primer(a);
                            b = field.primer(b);
                        }

                        reverse = (field.reverse) ? -1 : 1;

                        if (a < b) result = reverse * -1;
                        if (a > b) result = reverse * 1;
                        if (result !== 0) break;
                    }
                    return result;
                }
            }

            $scope.scoreboard.sort(sort_by({name: "score", reverse: true},{name: "achievements", reverse: true}))
            $scope.getBracketStandings = function(){
                return "Your Total Score: " + data[$scope.username]['Total Score']
            }
            $scope.getMiniScoreboard = function(i){
                if(i > $scope.scoreboard.length) return''
                var user = $scope.scoreboard[i-1]
                return "(" + i + ") " + user.name + ": " + user.score
            }

        }, function(data){
            console.log("OMG DATA")
            console.log(data);
        });

        if(!$scope.brackets_opened){
            $http({
                url: '/boxes_scoreboard.json', method: "GET", params: {username: $window.localStorage.user}
            }).success(function(data){
                $scope.box_scoreboard =  data;
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

                $scope.getBoxStandings = function(){
                    if(!($scope.username in $scope.box_scoreboard)){
                        return $sce.trustAsHtml( "No Box Wins Yet!" );
                    }
                    var your_box = $scope.box_scoreboard[$scope.username];
                    var stats = "Total Box Wins: " + your_box.length;
                    var stat_arr = {"total_points": 0}
                    for(var i = 0; i < your_box.length; i++){
                        var round = your_box[i]['round'];
                        if(!(('round_'+  round) in stat_arr)){
                            stat_arr['round_'+round] = {round: round, wins: 0}
                        }
                        stat_arr['round_'+round]['wins'] += 1;
                        stat_arr['total_points'] += Math.pow(2,round-1);
                    }
                    stats += "<br>Total Points: " + stat_arr['total_points'];
                    for(var r in stat_arr){
                        if(r != 'total_points'){

                            stats += "<br>Round " + stat_arr[r]['round'] + " Wins: " + stat_arr[r]['wins'];
                        }
                    }
                    return $sce.trustAsHtml(stats);
                }
            });

            $http({
                url: '/achievements.json', method: "GET", params: {username: $scope.username}
            }).success(function(data){
                $scope.totalAchievementsOwned = 0;
                $scope.res_owned = 0;
                $scope.ts_owned = 0;
                if(data['userAchievements'] != null && $scope.username in data['userAchievements']) {
                    $scope.myAchievements = data['userAchievements'][$scope.username]

                    var start_box_achievement = 20;
                    var start_resistance_achievement = 34;
                    var start_ts_achievement = 45;

                    if ($scope.myAchievements != null) {
                        for (var i = 0; i < $scope.myAchievements.length; i++) {
                            if ($scope.myAchievements[i]['owned']) {
                                $scope.totalAchievementsOwned += 1;
                                if (i < start_box_achievement) {

                                } else if (i < start_resistance_achievement) {

                                } else if (i < start_ts_achievement) {
                                    $scope.res_owned += 1;
                                } else {
                                    $scope.ts_owned += 1;
                                }
                            }
                        }
                    }
                }





                $scope.getAchievementStats = function(){
                    var stats = "Total Achievements: " + $scope.totalAchievementsOwned;

                    stats += "<br>Resistance Achievements: " + $scope.res_owned;
                    stats += "<br>Taylor Swift Achievements: " + $scope.ts_owned;
                    return $sce.trustAsHtml(stats);
                }
            }).error(function(data){
                console.log(data);

            });
        }

        $http.get('/is_bracket_opened.json').success(function(data){
            $scope.brackets_opened = data['result']
        }).error(function(data){
            console.log(data);
        });
    }


	$scope.toggleCollapse = function(){
		$scope.isCollapsed = !$scope.isCollapsed
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



}])
    .directive('collapseWidth', ['$transition', 'collapseService', function ($transition, collapseService) {

        return {
            link: function (scope, element, attrs) {

                var initialAnimSkip = true;
                var currentTransition;
                collapseService.setCollapse(attrs.collapseWidth);

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
                        doTransition({ width: element[0].scrollWidth + 'px', padding: '10px 15px' }).then(expandDone);
                    }
                }

                function expandDone() {
                    element.removeClass('collapsing-width');
                    element.addClass('collapse in');
                    element.css({width: 'auto', padding: '10px 15px'});
                    collapseService.doneExpanding();
                }

                function collapse() {
                    if (initialAnimSkip) {
                        initialAnimSkip = false;
                        collapseDone();
                        element.css({width: 0, padding: 0});
                    } else {
                        // CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
                        element.css({ width: element[0].scrollWidth + 'px', padding: '10px 15px' });
                        //trigger reflow so a browser realizes that height was updated from auto to a specific value
                        var x = element[0].offsetHeight;

                        element.removeClass('collapse in').addClass('collapsing-width');

                        doTransition({ width: 0, padding: '10px 15px'}).then(collapseDone);
                    }
                }

                function collapseDone() {
                    element.css({padding: 0})
                    element.removeClass('collapsing-width');
                    element.addClass('collapse custom-collapsed');
                    collapseService.doneCollapsing();
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
	.directive('outerTab', ['collapseService', function(collapseService) {

		return {
			link: function (scope, element, attrs) {
				var col = attrs.makeColor;
				var attach = angular.element( document.querySelector( '#' + attrs.alignTo ) );
				//console.log(element);
				var new_left = attach[0].offsetLeft;
				var new_top = attach[0].offsetTop ;
				element.css("position", "absolute");
				element.css("left", 0);
				element.css("top", new_top);
				element.css("font-size", "large");


                scope.$watch(function(){
                    return collapseService.isCollapsed();
                }, function (newval) {
                    if (newval) {
                        element.css("display", "block");
                    }else{
                        element.css("display", "none");
                    }
                });

			}
		}
	}]).factory('collapseService', function(){
        var collapseService = {}
        this.collapsed = false;
        collapseService.setCollapse = function(bool){
            this.collapsed = bool;
        }
        collapseService.isCollapsed = function(){
            return this.collapsed;
        }
        collapseService.doneCollapsing = function(){
            this.collapsed = true;
        }
        collapseService.doneExpanding = function(){
            this.collapsed = false;
        }
        return collapseService;
    });