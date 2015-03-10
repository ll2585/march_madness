angular.module('bracketRoutes', []).config(['$routeProvider', '$locationProvider','$httpProvider', function($routeProvider, $locationProvider,$httpProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'partials/home.html',
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
        })
        .when('/signin', {
            templateUrl: 'partials/signin.html',
            controller: 'MainController'
        })
        . when('/signup', {
                templateUrl: 'partials/signup.html',
                controller: 'MainController'
            })
            .when('/me', {
            templateUrl: 'partials/me.html',
            controller: 'MainController'
        })
        .otherwise({
            redirectTo: '/'
        });

	$locationProvider.html5Mode(true);

}]).config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
}).run(function($rootScope, $location, $window, AuthenticationService) {
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
        //redirect only if both isAuthenticated is false and no token is set
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredAuthentication
            && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {

            $location.path("/admin/login");
        }
    });
});