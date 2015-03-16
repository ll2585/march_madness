angular.module('bracketRoutes', []).config(['$routeProvider', '$locationProvider','$httpProvider', function($routeProvider, $locationProvider,$httpProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'partials/home',
			controller: 'MainPageController',
            access: { requiredAuthentication: true }
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
        .when('/bracket-angular/:name', {
            templateUrl: function(name) {
                return 'partials/bracket-angular/' + name.name;
            },
            controller: 'BracketControllerAngular',
            access: { requiredAuthentication: true }
        })
        .when('/minigame', {
            templateUrl: 'partials/minigame',
            controller: 'MiniGameController',
			access: { requiredAuthentication: true }
        })
		.when('/login', {
			templateUrl: 'partials/login',
			controller: 'MainController'
		})
        .otherwise({
            redirectTo: '/login'
        });

	$locationProvider.html5Mode(true);

}]).config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
}).run(function($rootScope, $location, $window, AuthenticationService) {
    AuthenticationService.check();
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
		console.log("WE LOOKING");
        //redirect only if both isAuthenticated is false and no token is set
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredAuthentication
            && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {
			console.log("REROOT BITCH");
            $location.path("/login");
        }else {
            // check if user object exists else fetch it. This is incase of a page refresh
            if (!AuthenticationService.user) AuthenticationService.user = $window.sessionStorage.user;
            if (!AuthenticationService.userRole) AuthenticationService.userRole = $window.sessionStorage.userRole;
        }


    });

    $rootScope.$on('$routeChangeSuccess', function(event, nextRoute, currentRoute) {
        $rootScope.showMenu = AuthenticationService.isAuthenticated;
        $rootScope.role = AuthenticationService.userRole;
        // if the user is already logged in, take him to the home page
        if (AuthenticationService.isAuthenticated == true && $location.path() == '/login') {
            $location.path('/');
        }
    });
});