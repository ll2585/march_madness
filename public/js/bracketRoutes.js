angular.module('bracketRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'partials/home',
			controller: 'MainController'
		})

		.when('/bracket', {
			templateUrl: 'partials/bracket',
			controller: 'BracketController'
		})

		.when('/box', {
			templateUrl: 'partials/box',
			controller: 'BoxController'	
		})

		.when('/box-angular', {
			templateUrl: 'partials/box-angular',
			controller: 'BoxControllerAngular'
		})

		.when('/bracket-angular', {
			templateUrl: 'partials/bracket-angular',
			controller: 'BracketControllerAngular'
		})

        .when('/minigame', {
            templateUrl: 'partials/minigame',
            controller: 'MiniGameController'
        });

	$locationProvider.html5Mode(true);

}]);