angular.module('bracketRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'partials/home',
			controller: 'MainController'
		})

		.when('/nerds', {
			templateUrl: 'partials/nerd',
			controller: 'BracketController'
		})

		.when('/geeks', {
			templateUrl: 'partials/geek',
			controller: 'BoxController'	
		});

	$locationProvider.html5Mode(true);

}]);