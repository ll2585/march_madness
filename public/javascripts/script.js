// script.js
'use strict';

// create the module and name it scotchApp
var app = angular.module('app', ['ngResource', 'ngRoute', 'ngAnimate']);

// configure our routes
app.config(function($routeProvider, $locationProvider, $httpProvider) {
	var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
		// Initialize a new promise
		var deferred = $q.defer();

		// Make an AJAX call to check if the user is logged in
		$http.get('/loggedin').success(function(user){
			// Authenticated
			if (user !== '0')
			/*$timeout(deferred.resolve, 0);*/
				deferred.resolve();

			// Not Authenticated
			else {
				$rootScope.message = 'You need to log in.';
				//$timeout(function(){deferred.reject();}, 0);
				deferred.reject();
				$location.url('/login');
			}
		});

		return deferred.promise;
	};

	$httpProvider.interceptors.push(function($q, $location) {
		return {
			response: function(response) {
				// do something on success
				return response;
			},
			responseError: function(response) {
				if (response.status === 401)
					$location.url('/login');
				return $q.reject(response);
			}
		};
	});

    $routeProvider

        // route for the home page
        .when('/', {
            templateUrl: 'partials/home',
            controller  : 'mainController'
        })

        // route for the about page
        .when('/sign-in', {
            templateUrl : 'partials/sign-in',
            controller  : 'signInController'
        })

	    .when('/thanks', {
		    templateUrl : 'partials/thanks',
		    controller  : 'thanksController'
	    })

	    .when('/admin', {
		    templateUrl: 'partials/admin',
		    controller: 'AdminCtrl',
		    resolve: {
			    loggedin: checkLoggedin
		    }
	    })

        // route for the contact page
        .when('/register', {
            templateUrl : 'partials/register',
            controller  : 'registerController'
        });



})
	.run(function($rootScope, $http) {
		$rootScope.message = '';

		// Logout function is available in any pages
		$rootScope.logout = function () {
			$rootScope.message = 'Logged out.';
			$http.post('/logout');
		};
	});

// create the controller and inject Angular's $scope
app.controller('mainController', function($scope) {
    // create a message to display in our view
    console.log("MAUIN:");
    $scope.pageClass = 'page-home';
});

app.controller('AdminCtrl', function($scope, $http) {
	// List of users got from the server
	$scope.users = [];

	// Fill the array to display it in the page
	$http.get('/users').success(function(users){
		for (var i in users)
			$scope.users.push(users[i]);
	});
});

app.controller('signInController', function($scope) {
    $scope.pageClass = 'page-sign-in';
});

app.controller('thanksController', function($scope) {
	$scope.pageClass = 'page-thanks';
});

app.controller('registerController', function ($scope, $http, $location) {
    $scope.pageClass = 'page-register';
	var user,
		signup;

	// Here we're creating a scope for our Signup page.
	// This will hold our data and methods for this page.
	$scope.signup = signup = {};

	// In our signup.html, we'll be using the ng-model
	// attribute to populate this object.
	signup.user = user = {};

	// This is our method that will post to our server.
	signup.submit = function () {
		console.log(user);
		console.log(user.name);

		// make sure all fields are filled out...
		// aren't you glad you're not typing out
		// $scope.signup.user.firstname everytime now??
		if (
			!user.name ||
			!user.email
		) {
			alert('Please fill out all form fields.');
			return false;
		}

		// Just so we can confirm that the bindings are working
		console.log(user);

		// Make the request to the server ... which doesn't exist just yet
		var request = $http.post('submit', user);

		// we'll come back to here and fill in more when ready
		request.success(function (data) {
			// to be filled in on success
			console.log(data.msg);
			$location.url('/thanks');
		});

		request.error(function (data) {
			// to be filled in on error
			console.log(data.msg);
		});

	};
});
