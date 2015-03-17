angular.module('MainPageCtrl', []).controller('MainPageController', ['$rootScope', '$scope', 'userInfoFactory', '$window', '$q', '$http', function($rootScope, $scope, userInfoFactory, $window, $q, $http) {

    $rootScope.$on('start-tutorial', function(event, obj){
		$scope.start();
    });

    $http.get('/is_bracket_opened.json').success(function(data){
        $scope.brackets_opened = data['result']
    }).error(function(data){
        console.log(data);
    });

    $scope.getFlags = function(){
        if(!$window.sessionStorage.userFlags){
            userInfoFactory.getFlags($window.sessionStorage.token, $window.sessionStorage.user).then(function(data) {
                $scope.userInfo = data.data;

                $scope.skipped_main_page = data.data.skipped_main_page;
				if(!$scope.skipped_main_page){
					$scope.startJoyRide = true;
				}
                $window.sessionStorage.data = data.data;
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
    $scope.getScoreboard($window.sessionStorage.user).then(function(data){

        $scope.scoreboard = [];
        var sorted_keys = Object.keys(data).sort(function(a,b){return data[b]-data[a]})
        for(var i = 0; i < sorted_keys.length; i++){
            var name = sorted_keys[i]
            var score = data[name]
            $scope.scoreboard.push({rank: i+1, name: name, score: score, achievements: 0})
        }


        //copy the references (you could clone ie angular.copy but then have to go through a dirty checking for the matches)
        $scope.displayedCollection = [].concat($scope.scoreboard);
    });

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
    $scope.getMoneyboard($window.sessionStorage.user).then(function(data){

        $scope.moneyBoard = data;
        console.log($scope.moneyBoard)
    });

    $scope.makeNice = function(playerArr){
        var players = ''
        if(playerArr.length == 0){
            players = 'None';
        }else{
            players= playerArr.join('<br>')
        }
        return players;
    }
    $scope.getValue = function(row){
        var hide_vals = [
            "Closest To 50 Points", "First to be Eliminated", "Winner after Day 1", "Winner after Day 2"
        ]
        var category = row.category
        if(hide_vals.indexOf(category) > -1){
            return ''
        }
        return row.value;
    }


	$scope.startJoyRide = false;
	$scope.start = function () {
		$scope.startJoyRide = true;
	}

	$scope.config = [

		{
			type: "title",
			heading: "Welcome to the NG-Joyride demo",
			text: 'Press next to learn how to use this site, or skip if you think you already know.',
			curtainClass: "randomClass"

		},
		{
			type: "element",
			selector: "#brackets-opened-tag",
			heading: "Title can have <em>HTML</em>",
			text: "This label indicates whether the bracket is open (you can make picks) or closed.",
			placement: "bottom",
			scroll: true
		},
		{
			type: "element",
			selector: ".Bracket",
			heading: "Step 1",
			text: "If it is opened, you can click this button here to go to the bracket and make picks (don't do this now)",
			placement: "right",
			curtainClass: "blueColour",
			scroll: true
		},
		{
			type: "element",
			selector: "#leader-board",
			heading: "Step 2",
			text: "If it is closed, your scores will appear here.",
			placement: "right",
			scroll: true
		},
        {
            type: "element",
            selector: ".round-0-scores",
            heading: "Step 2",
            text: "This column indicates the points per correct pick for this round, and the point breakdown.",
            placement: "bottom",
            scroll: true
        },
        {
            type: "element",
            selector: ".achievements_col",
            heading: "Step 2",
            text: "Tie breakers are any achievements.",
            placement: "bottom",
            scroll: true
        },
        {
            type: "element",
            selector: ".Achievements",
            heading: "Step 2",
            text: "You can click here to see the achievements you have earned and can get.",
            placement: "right",
            scroll: true
        },
        {
            type: "element",
            selector: "#impBtn",
            heading: "Step 2",
            text: "This table shows the current winning leaders for MONEY.",
            placement: "right",
            scroll: true
        },
        {
            type: "element",
            selector: "#impBtn",
            heading: "Step 2",
            text: "These are the categories for winning money.",
            placement: "right",
            scroll: true
        },
        {
            type: "element",
            selector: "#impBtn",
            heading: "Step 2",
            text: "These are the current leaders.  Blue is final, red is temporary.",
            placement: "right",
            scroll: true
        },
        {
            type: "element",
            selector: "#impBtn",
            heading: "Step 2",
            text: "And this is how many points they have.",
            placement: "right",
            scroll: true
        },
        {
            type: "element",
            selector: "#impBtn",
            heading: "Step 2",
            text: "This is your number of points in this category.",
            placement: "right",
            scroll: true
        },
        {
            type: "element",
            selector: "#impBtn",
            heading: "Step 2",
            text: "This button brings you to the box, which is one of the winning categories.",
            placement: "right",
            scroll: true
        },
        {
            type: "element",
            selector: "#impBtn",
            heading: "Step 2",
            text: "And this button brings you to the minigame.",
            placement: "right",
            scroll: true
        },
        {
            type: "element",
            selector: "#impBtn",
            heading: "Step 2",
            text: "You can click this button to show a quick summary of all the sections.",
            placement: "right",
            scroll: true
        },
        {
            type: "element",
            selector: "#impBtn",
            heading: "Step 2",
            text: "The end! Have fun.",
            placement: "right",
            scroll: true
        }
	];

	$scope.onFinish = function () {
		userInfoFactory.sendFlags($window.sessionStorage.token, $window.sessionStorage.user, 'skipped_main_page', true);
		$scope.skipped_main_page = true;
		$rootScope.$broadcast('CLOSE_MODAL');

	};

}]);