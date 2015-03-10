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
			controller: 'BoxControllerAngular',
			access: { requiredAuthentication: true }
		})

		.when('/bracket-angular', {
			templateUrl: 'partials/bracket-angular',
			controller: 'BracketControllerAngular',
			access: { requiredAuthentication: true }
		})

        .when('/minigame', {
            templateUrl: 'partials/minigame',
            controller: 'MiniGameController',
			access: { requiredAuthentication: true }
        })
        .when('/login', {
            templateUrl: 'partials/signin.html',
            controller: 'MainController'
        })
        .when('/register', {
                templateUrl: 'partials/signup.html',
                controller: 'MainController'
	   })
		.when('/logout', {
			templateUrl: 'partials/logout.html',
			controller: 'MainController',
			access: { requiredAuthentication: true }
		})
		.when('/me', {
            templateUrl: 'partials/me.html',
            controller: 'MainController',
			access: { requiredAuthentication: true }
        })
        .otherwise({
            redirectTo: '/'
        });

	$locationProvider.html5Mode(true);

}]).config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
}).run(function($rootScope, $location, $window, AuthenticationService) {
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
		console.log("WE LOOKING");
		console.log(AuthenticationService);
		console.log($window.sessionStorage.token);
        //redirect only if both isAuthenticated is false and no token is set
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredAuthentication
            && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {
			console.log("REROOT BITCH");
            $location.path("/login");
        }

    });
});