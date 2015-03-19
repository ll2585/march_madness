angular.module('MainPageCtrl', []).controller('MainPageController', ['$rootScope', '$scope', 'userInfoFactory', '$window', '$q', '$http', '$sce', function($rootScope, $scope, userInfoFactory, $window, $q, $http, $sce) {

    $rootScope.$on('start-tutorial', function(event, obj){
		$scope.start();
    });

    $http.get('/is_bracket_opened.json').success(function(data){
        $scope.brackets_opened = data['result']
		if($scope.brackets_opened){
			$http({
				url: '/getUsers.json', method: "GET"
			}).success(function(data){
				$scope.scoreboard = [];
				for (var i = 0; i < data.length; i++) {
					var name = data[i]['name']
					$scope.scoreboard.push({rank: i + 1, name: name})
				}


				//copy the references (you could clone ie angular.copy but then have to go through a dirty checking for the matches)
				$scope.displayedCollection = [].concat($scope.scoreboard);
			}).error(function(){

			});
		}else {
			$scope.getScoreboard($window.localStorage.user).then(function (data) {

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
				var last_score = -1;
				var last_rank = -1;
				var last_achievements = -1;
				for (var i = 0; i < $scope.scoreboard.length; i++) {
					var score = $scope.scoreboard[i]['score']
					var achievements = $scope.scoreboard[i]['achievements']
					var rank = last_score == score && achievements == last_achievements ? last_rank : i + 1;
					last_score = score;
					last_achievements = achievements;
					last_rank = rank;
					$scope.scoreboard[i]['rank'] = rank;
				}


				//copy the references (you could clone ie angular.copy but then have to go through a dirty checking for the matches)
				$scope.displayedCollection = [].concat($scope.scoreboard);

			});
		}
    }).error(function(data){
        console.log(data);
    });

    $scope.getFlags = function(){
        if(!$window.localStorage.userFlags){
            userInfoFactory.getFlags($window.localStorage.token, $window.localStorage.user).then(function(data) {
                $scope.userInfo = data.data;

                $scope.skipped_main_page = data.data.skipped_main_page;
				if(!$scope.skipped_main_page){
					$scope.startJoyRide = true;
				}
                $window.localStorage.data = data.data;
            });
        }
    };

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
    $scope.Math = window.Math;
    $scope.tournamentRounds = ["Round of 64","Round of 32","Round of 16","Elite Eight","Final Four","National Championship Game"]
    $scope.getFlags();



    $scope.getMoneyboard = function(username) {
        var deferred = $q.defer();
        $http({
            url: '/moneyboard.json', method: "GET", params: {username: username}
        }).success(function(data){
            deferred.resolve(data);
        }).error(function(){
            deferred.reject("No official bracket yet.")

        });

        return deferred.promise;
    };
    $scope.getMoneyboard($window.localStorage.user).then(function(data){
        $scope.moneyBoard = data;


    });

    $scope.makeNice = function(playerArr){
        var players = ''
        if(playerArr.length == 0){
            players = 'None';
        }else{
            players= playerArr.join('<br>')
        }
        return $sce.trustAsHtml(players);
    }
    $scope.getValue = function(row){
        var hide_vals = [
            "Closest To 50 Points", "First to be Eliminated", "Winner after Day 1", "Winner after Day 2"
        ]
        var category = row.category
        if(hide_vals.indexOf(category) > -1){
            return ''
        }
        return row.score;
    }


	$scope.startJoyRide = false;
	$scope.start = function () {
		$scope.startJoyRide = true;
	}

	$scope.config = [
		{
			type: "title",
			heading: "Welcome to March Madness Madness 2015!",
			text: 'Press next to learn how to use this site, or skip if you think you already know. Literally all you have to do is fill in your bracket and submit it.'
		},
		{
			type: "element",
			selector: "#brackets-opened-tag",
			heading: "Basics (1/13)",
			text: "This label indicates whether the bracket is open (you can make picks) or closed.",
			placement: "bottom",
			scrollPadding: 250,
			scroll: true
		},
		{
			type: "element",
			selector: ".Bracket",
			heading: "Basics (2/13)",
			text: "If it is opened, you can click this button here to go to the bracket and make picks (don't do this now)",
			placement: "right",
			curtainClass: "blueColour",
			scrollPadding: 250,
			scroll: true
		},
		{
			type: "element",
			selector: "#money-board",
			heading: "Who Wins? (3/13)",
			text: "This table shows who can win money, and how much they can win.",
			placement: "top",
			scrollPadding: 250,
			scroll: true
		},
		{
			type: "element",
			selector: "#money-category",
			heading: "Who Wins? (4/13)",
			text: "These are the categories for winning money.",
			placement: "top",
			scrollPadding: 250,
			scroll: true
		},
		{
			type: "element",
			selector: "#player-category",
			heading: "Who Wins? (5/13)",
			text: "These are the current leaders.  Blue is temporary, red is final.",
			placement: "top",
			scrollPadding: 250,
			scroll: true
		},
		{
			type: "element",
			selector: ".first-place",
			heading: "Who Wins? (6/13)",
			text: "The player who wins the entire bracket will win the most money.",
			placement: "top",
			scrollPadding: 250,
			scroll: true
		},
		{
			type: "element",
			selector: "#leader-board",
			heading: "Scores (7/13)",
			text: "This scoreboard shows who is winning in the bracket.",
			placement: "top",
			scroll: true
		},
        {
            type: "element",
            selector: ".round-0-scores",
            heading: "Scores (8/13)",
            text: "This column indicates the points per correct pick for this round, and the point breakdown.",
            placement: "bottom",
            scroll: true
        },
        {
            type: "element",
            selector: ".achievements_col",
            heading: "Scores (9/13)",
            text: "Tie breakers are any achievements.",
            placement: "bottom",
            scroll: true
        },
		{
			type: "element",
			selector: ".Achievements",
			heading: "Achievements (10/13)",
			text: "You can click here to see the achievements you have earned and can get (also a money category).",
			placement: "right",
			scrollPadding: 250,
			scroll: true
		},
        {
            type: "element",
            selector: ".Box",
            heading: "The Box (11/13)",
            text: "This button brings you to the box, which is can give you many achievements and involves no further action by you.",
            placement: "right",
			scrollPadding: 250,
            scroll: true
        },
        {
            type: "element",
            selector: ".glyphicon-transfer",
            heading: "Summary (12/13)",
            text: "You can click this button to show a quick summary of all the sections.",
            placement: "right",
			scrollPadding: 250,
            scroll: true
        },
        {
			type: "title",
            heading: "End! (13/13)",
            text: "The end! Have fun."
        }
	];

	$scope.onFinish = function () {
		userInfoFactory.sendFlags($window.localStorage.token, $window.localStorage.user, 'skipped_main_page', true);
		$scope.skipped_main_page = true;
		$rootScope.$broadcast('CLOSE_MODAL');

	};



}]);