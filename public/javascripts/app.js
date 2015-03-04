'use strict';

/**********************************************************************
 * Angular Application
 **********************************************************************/
var app = angular.module('app', ['ngResource', 'ngRoute'])
	.config(function($routeProvider, $locationProvider, $httpProvider) {
		//================================================
		// Check if the user is connected
		//================================================
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
		//================================================

		//================================================
		// Add an interceptor for AJAX errors
		//================================================
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
		//================================================

		//================================================
		// Define all the routes
		//================================================
		$routeProvider
			.when('/', {
				templateUrl: '/partials/bracket',
				resolve: {
					loggedin: checkLoggedin
				}
			})
			.when('/admin', {
				templateUrl: 'partials/admin',
				controller: 'AdminCtrl',
				resolve: {
					loggedin: checkLoggedin
				}
			})
			.when('/login', {
				templateUrl: 'partials/login',
				controller: 'LoginCtrl'
			})
			.when('/register', {
				templateUrl: 'partials/register',
				controller: 'RegisterCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});
		$locationProvider.html5Mode(true);
		//================================================

	}) // end of config()
	.run(function($rootScope, $http){
		$rootScope.message = '';

		// Logout function is available in any pages
		$rootScope.logout = function(){
			$rootScope.message = 'Logged out.';
			$http.post('/logout');
		};
	});


/**********************************************************************
 * Login controller
 **********************************************************************/
app.controller('LoginCtrl', function($scope, $rootScope, $http, $location) {
	// This object will be filled by the form
	$scope.user = {};

	// Register the login() function
	$scope.register = function(){
		$http.post('/login', {
			name: $scope.user.name,
			email: $scope.user.email
		})
			.success(function(user){
				// No error: authentication OK
				$rootScope.message = 'Authentication successful!';
				$location.url('/');
			})
			.error(function(){
				// Error: authentication failed
				$rootScope.message = 'Authentication failed.';
				$location.url('/login');
			});
	};
});

/**********************************************************************
 * Register controller
 **********************************************************************/
app.controller('RegisterCtrl', function($scope, $rootScope, $http, $location) {
	// This object will be filled by the form
	$scope.user = {};

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
			!user.username ||
			!user.password
		) {
			alert('Please fill out all form fields.');
			return false;
		}

		// Just so we can confirm that the bindings are working
		console.log(user);

		// Make the request to the server ... which doesn't exist just yet
		var request = $http.post('/register', user);

		// we'll come back to here and fill in more when ready
		request.success(function (data) {
			// to be filled in on success
			console.log(data.msg);
			$location.url('/thanks');
		});

		request.error(function (data) {
			// to be filled in on error
			console.log('failed');
			console.log(data.msg);
		});

	};
});



/**********************************************************************
 * Admin controller
 **********************************************************************/
app.controller('AdminCtrl', function($scope, $http) {
	// List of users got from the server
	$scope.users = [];

	// Fill the array to display it in the page
	$http.get('/users').success(function(users){
		for (var i in users)
			$scope.users.push(users[i]);
	});
});