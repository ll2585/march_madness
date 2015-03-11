angular.module('MainPageCtrl', ['bm.bsTour']).controller('MainPageController', ['$rootScope', '$scope', 'userInfoFactory', '$window', function($rootScope, $scope, userInfoFactory, $window) {

	$scope.tagline = 'To the moon and back!';

    $rootScope.$on('start-tutorial', function(event, obj){
		$scope.start();
    });

    $scope.getFlags = function(){
        if(!$window.sessionStorage.userFlags){
            userInfoFactory.getFlags($window.sessionStorage.token, $window.sessionStorage.user).then(function(data) {
                $scope.userInfo = data.data;

                $scope.skipped_main_page = data.data.skipped_main_page;
				if(!$scope.skipped_main_page){
					$scope.startJoyRide = true;
				}
				console.log($scope.skipped_main_page);
                $window.sessionStorage.data = data.data;
            });
        }
    };

    $scope.getFlags();


	$scope.awesomeThings = [
		'HTML5 Boilerplate',
		'AngularJS',
		'Karma'
	];
	var count = 0;
	$scope.startJoyRide = false;
	$scope.start = function () {
		if(count > 0){
			generateAlternateConfig();
		}
		count++;
		$scope.startJoyRide = true;

	}
	$scope.rowCollection = [
		{rank: 1, name: 'Laurent', score: 53, achievements: 4},
		{rank: 2, name: 'Blandine', score: 75, achievements: 5},
		{rank: 3, name: 'Francoise', score: 85, achievements: 6}
	];

	//copy the references (you could clone ie angular.copy but then have to go through a dirty checking for the matches)
	$scope.displayedCollection = [].concat($scope.rowCollection);
	function generateAlternateConfig(){
		//This is to show that it can have dynamic configs which can change . The joyride would not need to be initialized again.
		$scope.config[2].text = "I can have dynamic text that can change in between joyrides"
	}

	$scope.config = [

		{
			type: "title",
			heading: "Welcome to the NG-Joyride demo",
			text: '<div class="row"><div id="title-text" class="col-md-12"><span class="main-text">Welcome to <strong>Ng Joyride Demo</strong></span><br><span>( This demo will walk you through the features of Ng-Joyride. )</span><br/><br/><span class="small"><em>This can have custom html too !!!</em></span></div></div>',
			curtainClass: "randomClass"

		},
		{
			type: "element",
			selector: "#home",
			heading: "Title can have <em>HTML</em>",
			text: "You are in the <em>home page.</em>",
			placement: "bottom",
			scroll: true
		},
		{
			type: "element",
			selector: "#leader-board",
			heading: "Step 1",
			text: "I can come over any element.Even the background is customizable per step",
			placement: "bottom",
			curtainClass: "blueColour",
			scroll: true
		},
		{
			type: "element",
			selector: "#impBtn",
			heading: "Step 2",
			text: "I can change placement",
			placement: "right",
			scroll: true
		}
	];

	$scope.onFinish = function () {
		userInfoFactory.sendFlags($window.sessionStorage.token, $window.sessionStorage.user, 'skipped_main_page', true);
		scope.skipped_main_page = true;
		$rootScope.$broadcast('CLOSE_MODAL');


	};



}]).factory('userInfoFactory', function($http) {
    /** https://docs.angularjs.org/guide/providers **/
    var urlBase = '';
    var userInfoFactory = {};

    userInfoFactory.getFlags = function(token, username) {
        return $http({
            url: '/getFlags', method: "GET", params: {token: token, username: username}
        });
    };

	userInfoFactory.sendFlags = function(token, username, flag, val) {
		return $http.post( '/setFlags', {username: username, token: token, flag: flag, val: val });
	};

    return userInfoFactory;
});