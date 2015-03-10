angular.module('MainCtrl', ['bracketApp']).controller('MainController', ['$rootScope', '$scope', '$location', '$localStorage', '$window', 'UserService', 'AuthenticationService', '$http', 'messageCenterService', function($rootScope, $scope, $location, $localStorage, $window, UserService, AuthenticationService, $http, messageCenterService) {

	$scope.tagline = 'To the moon and back!';

    $scope.logIn = function logIn(username, password) {
		var no_username = (username === undefined || username == '');
		var no_password = (password === undefined || password == '');
        if(no_username && no_password){
			messageCenterService.add('danger', 'Please enter your information.', { timeout: 3000 });
		}else if(no_password){
			messageCenterService.add('danger', 'Please enter your username.', { timeout: 3000 });
		}else if(no_username){
			messageCenterService.add('danger', 'Please enter your password.', { timeout: 3000 });
		}else if (!no_username && !no_password) {
            UserService.logIn(username, password).success(function(data) {
				console.log("LIGGED INT");
                AuthenticationService.isAuthenticated = true;
                $window.sessionStorage.token = data.token;
				console.log(AuthenticationService);
                $location.path("/me");
            }).error(function(status, data) {
				console.log("SOERROR");
				messageCenterService.add('danger', status, { timeout: 3000 });
                console.log(status);
                console.log(data);
            });
        }
    }

    $scope.logOut = function logout() {
		if (AuthenticationService.isAuthenticated) {

			UserService.logOut().success(function(data) {
				AuthenticationService.isAuthenticated = false;
				delete $window.sessionStorage.token;
				$location.path("/");
			}).error(function(status, data) {
				console.log(status);
				console.log(data);
			});
		}
		else {
			$location.path("/login");
		}
    }

	$scope.register = function register(username, password, passwordConfirm) {
		if (AuthenticationService.isAuthenticated) {
			$location.path("/me");
		}
		else {
			UserService.register(username, password, passwordConfirm).success(function(data) {
				$location.path("/login");
			}).error(function(status, data) {
				console.log(status);
				console.log(data);
			});
		}
	}

    $scope.token = $localStorage.token;

}]).factory('UserService', function ($http) {
	return {
		logIn: function(username, password) {
			return $http.post('/login', {username: username, password: password});
		},

		logOut: function() {
			return $http.get('/logout');
		},

		register: function(username, password, passwordConfirmation) {
			return $http.post( '/register', {username: username, password: password, passwordConfirmation: passwordConfirmation });
		}
	}
});