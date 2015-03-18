angular.module('AchievementCtrl', []).controller('AchievementsController', ['$scope', '$rootScope', '$http', 'achievementFactory','$window', 'userInfoFactory', function($scope, $rootScope, $http, achievementFactory, $window, userInfoFactory) {
    $scope.setUsername = function(n){
        $scope.username = n == undefined ? $window.sessionStorage.user :  n;
    };
    $http.get('/is_bracket_opened.json').success(function(data){
        $scope.brackets_opened = data['result']
		if(!$scope.brackets_opened){
			$http({
				url: '/getUsers.json', method: "GET"
			}).success(function(data){
				$scope.users = data;
				console.log($scope.users)
			}).error(function(){

			});
		}
    }).error(function(data){
        console.log(data);
    });
    $scope.achievementDescriptions = [
        "Finish your bracket",
        "Correctly choose 10 or more dog teams to win.",
        "Correctly choose 15 or more cat teams to win.",
        "Correctly choose 10 or more matchups.",
        "Correctly choose 25 or more matchups.",
        "Correctly choose 50 or more matchups.",
        "Win your minigame.",
        "End the game tied with another player.",
        "Get within 5 points of the total points scored of the championship match (teams don't matter).",
        "Guess the final score within 7 points of both teams' score of the championship match (teams don't matter).",
        "Correctly choose the first 12 matchups.",
        "Get two correct picks in the Final Four (both teams and winner).",
        "Choose the correct champion's region.",
        "Get 75% of Round 1 picks right.",
        "Have your champion lose in the Round of 64.",
        "Incorrectly choose the winner of a match 20 times (must have both teams correct).",
        "Have your champion be upset in the championship game.",
        "Have the team that beat the team you chose to win lose in the next round 12 times.",
        "Be eliminated from one region after the Round of 16.",
        "Have your champion be the only team remaining in your pool in the Final Four.",
        "Don't win any boxes.",
        "Win a box in the Round of 64.",
        "Win a box in the Round of 32.",
        "Win a box in the Round of 16.",
        "Win a box in the Elite Eight.",
        "Win a box in the Final Four.",
        "Win the box in the Championship Match.",
        "Win only one box.",
        "Win at least 10 boxes.",
        "Win at least 25 boxes.",
        "Win at least 50 boxes.",
        "Win 2 times in the same round.",
        "Win 4 times in the same round.",
        "Win 8 times in the same round.",
        "Correctly choose 3/4 teams in the Final Four.",
        "Correctly choose a team ranked below 4 to be in the Final Four.",
        "Have exactly 1 more point than someone else by the end.",
        "Correctly choose an upset, but choose the wrong team to win, 5 times, starting in the Round of 32.",
        "Correctly choose when Duke loses.",
        "Correctly choose 5/8 teams in the Round of 8.",
        "For days 3-5 (both days of Round of 32, first day of Round of 16), in all regions, either correctly choose a team to lose on 'switch' or correctly choose a team to win if not.",
        "Correctly choose a non-red and non-blue team to defeat a red team and a blue team (must have all 3 teams right.)",
        "Correctly choose 5/8 teams in the Round of 8, but choose less than 3/4 teams in the Final Four.",
        "Correctly choose a blue team and a red team to win in the same round.",
        "In a matchup of a red team vs. a blue team, incorrectly choose the right team to win (must have both teams right).",
        "Have exactly 22 points for at least 22 minutes.",
        "Choose the correct finals matchup.",
        "Get knocked out after the Final Four.",
        "Be ahead of someone for only one day.",
        "Correctly choose a team ranked 1, 2, 3 or 4 to lose in either the Round of 64 or the Round of 32.",
        "Correctly choose a blue team to beat a red team.",
        "Have all 8 teams right in any region during the Round of 32.",
        "Lose a matchup you were winning in the last 5 seconds.",
        "Win two consecutive matchups that you were losing in the last minute."
    ]
    $scope.loadAchievements = function(){
        $scope.$watch("username", function() {
            achievementFactory.getAchievements($scope.username).then(function (data) {
                $scope.allAchievements = data['achievements'];
                $scope.myAchievements = data['userAchievements'][$scope.username]
				$scope.achievement_dict = {};
				$scope.totalAchievementsOwned = 0;
				if($scope.myAchievements != null){
					for(var i = 0; i < $scope.myAchievements.length; i++){
						$scope.achievement_dict[$scope.myAchievements[i]['achievement']] = i;
						if( $scope.myAchievements[i]['owned']){
							$scope.totalAchievementsOwned += 1;
						}
					}
				}

                $scope.regularAchievements = [];
                $scope.boxAchievements = [];
                $scope.resistanceAchievements = [];
                $scope.tsAchievements = [];

                $scope.regularAchievementsDesc = [];
                $scope.boxAchievementsDesc = [];
                $scope.resistanceAchievementsDesc = [];
                $scope.tsAchievementsDesc = [];
                var start_box_achievement = 20;
                var start_resistance_achievement = 34;
                var start_ts_achievement = 45;
                for(var i = 0; i < $scope.allAchievements.length; i++){
                    if(i < start_box_achievement){
                        $scope.regularAchievements.push($scope.allAchievements[i])
                        $scope.regularAchievementsDesc.push($scope.achievementDescriptions[i])
                    }else if(i < start_resistance_achievement){
                        $scope.boxAchievements.push($scope.allAchievements[i])
                        $scope.boxAchievementsDesc.push($scope.achievementDescriptions[i])
                    }else if(i < start_ts_achievement){
                        $scope.resistanceAchievements.push($scope.allAchievements[i])
                        $scope.resistanceAchievementsDesc.push($scope.achievementDescriptions[i])
                    }else{
                        $scope.tsAchievements.push($scope.allAchievements[i])
                        $scope.tsAchievementsDesc.push($scope.achievementDescriptions[i])
                    }
                }
                $scope.getFlags();

            });
        });
    };
    $scope.getFlags = function(){
        if(!$window.sessionStorage.userFlags){
            userInfoFactory.getFlags($window.sessionStorage.token, $window.sessionStorage.user).then(function(data) {
                $scope.skipped_achievement_page = data.data.skipped_achievement_page;
                if(!$scope.skipped_achievement_page){
                    $scope.start();
                }
            });
        }
    };

    $scope.getDescription = function(index, arr){
        var arr_map = {
            'reg': $scope.regularAchievementsDesc,
            'box': $scope.boxAchievementsDesc,
        'res': $scope.resistanceAchievementsDesc,
        'ts': $scope.tsAchievementsDesc
        };
        if(arr_map[arr][index] === undefined){
            return null
        }
        return arr_map[arr][index]
    }
    $scope.ownAchievement = function(achievementName){
        if(achievementName == undefined){
            return false;
        }
        if($scope.myAchievements == null){
            return false;
        }
		var achievement_index = $scope.achievement_dict[achievementName]

        return $scope.myAchievements[achievement_index]['owned'];
    }
    $scope.onFinish = function () {
        $scope.skipped_achievement_page = true;
        userInfoFactory.sendFlags($window.sessionStorage.token, $window.sessionStorage.user, 'skipped_achievement_page', true);
		$scope.merlin_unlocked = false;
    };

    $rootScope.$on('start-tutorial', function(event, obj){
        $scope.start();
    });

    $scope.loadAchievements();
    $scope.startJoyRide = false;
    $scope.start = function () {
        $scope.skipped_achievement_page = false;
        $scope.startJoyRide = true;

    }
    $scope.config = [

        {//0
            type: "title",
            heading: "THE ACHIEVEMENTS",
            text: '<div class="row"><div id="title-text" class="col-md-12"><span class="main-text">Welcome to the <strong> Achievement Page</strong></span><br><span>Please click "Next" to learn about achievements, or click "Skip" if you already know.</span></div></div>',
            curtainClass: "championship-bracket"
        },
        {
            type: "element",
            selector: ".container",
            heading: "Basics (1)",
            text: "Here are the achievements.",
            placement: "top",
            scrollPadding: 250,
            scroll: true
        },
		{
			type: "element",
			selector: ".reg-achievement-header",
			heading: "Basics (2)",
			text: "There are four categories of achievements. Players with the most total achievements, most resistance and most Taylor Swift achievements will win money.",
			placement: "top",
			scrollPadding: 250,
			scroll: true
		},
		{
			type: "element",
			selector: ".joyride-1",
			heading: "Basics (3)",
			text: "If you unlock an achievement...",
			placement: "top",
			scrollPadding: 250,
			scroll: true
		},
		{
			type: "function",
			fn: 'unlockMerlinJoyride'
		},
		{
			type: "element",
			selector: ".joyride-1",
			heading: "Basics (1)",
			text: "The row will turn blue and the icon will be colored!.",
			placement: "top",
			scrollPadding: 250,
			scroll: true
		},
		{
			type: "function",
			fn: 'lockMerlinJoyride'
		},
		{
			type: "title",
			heading: "The End! (7/7)",
			text: "The end! If you are uncertain about any achievements, please ask Luke.",
			scroll: true
		}
    ];

	$scope.unlockMerlinJoyride = function(){
		$scope.merlin_unlocked = true;
	};
	$scope.lockMerlinJoyride = function(){
		$scope.merlin_unlocked = false;
		$window.scrollTo(0,0)
	};

	$scope.merlin_unlocked = false;

}]).factory('achievementFactory', function($http, $q) {

    var achievementFactory = {};

    achievementFactory.getAchievements = function(username) {
        var deferred = $q.defer();
        $http({
            url: '/achievements.json', method: "GET", params: {username: username}
        }).success(function(data){
            deferred.resolve(data);
        }).error(function(data){
            console.log(data);

        });

        return deferred.promise;
    };

    return achievementFactory;
}).directive('achievementText', function() {
    return {
        scope: {
            achievementName: '@',
            achievementDesc: '@'
        },
        restrict: 'E',
        template: '<div class="achieveTxtHolder"><div class="achieveTxt"><h3>{{achievementName}}</h3><h5>{{achievementDesc}}</h5></div></div>'
    };
}).directive('achievementImage', function() {
    return {
        scope: {
            initialPath: '@',
            owned: '@'
        },
        restrict: 'E',
        template: '<div class="achieveImgHolder"><img src="{{img}}" width="64" height="64" border="0"></div>',
        link: function(scope,element,attrs){
            scope.img = "/img/achievements/" + scope.initialPath
            if(scope.owned == 'false'){
                scope.img += "_no"
            }
            scope.img += ".png";
        }
    };
});