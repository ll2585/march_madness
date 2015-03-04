// script.js

// create the module and name it scotchApp
var scotchApp = angular.module('scotchApp', ['ngRoute', 'ngAnimate']);

// configure our routes
scotchApp.config(function($routeProvider, $locationProvider) {
    $routeProvider

        // route for the home page
        .when('/', {
            templateUrl: 'partials/home',
            controller  : 'mainController'
        })

        // route for the about page
        .when('/about', {
            templateUrl : 'partials/about',
            controller  : 'aboutController'
        })

        // route for the contact page
        .when('/contact', {
            templateUrl : 'partials/contact',
            controller  : 'contactController'
        });
    $locationProvider.html5Mode(true);
});

// create the controller and inject Angular's $scope
scotchApp.controller('mainController', function($scope) {
    // create a message to display in our view
    console.log("MAUIN:");
    $scope.pageClass = 'page-home';
});

scotchApp.controller('aboutController', function($scope) {
    $scope.pageClass = 'page-about';
});

scotchApp.controller('contactController', function($scope) {
    $scope.pageClass = 'page-contact';
});
