angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

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

        .when('/minigame', {
            templateUrl: 'partials/minigame',
            controller: 'MiniGameController'
        });

    $locationProvider.html5Mode(true);

}]);