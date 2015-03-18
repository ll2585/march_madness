angular.module('MainCtrl', ['bracketApp']).controller('MainController', ['$rootScope', '$scope', '$location', '$localStorage', '$window', 'UserService', 'AuthenticationService', '$http', '$alert', '$cookieStore', 'userInfoFactory', function($rootScope, $scope, $location, $localStorage, $window, UserService, AuthenticationService, $http, $alert, $cookieStore, userInfoFactory) {

	$scope.tagline = 'To the moon and back!';
    $scope.show_sign_up = function(){
        alert("SHOW");
    }

    $scope.logIn = function logIn(username, password) {
        $scope.alert = {content: 'Best check yo self, you\'re not looking too good.', type: 'danger',
            container: "#login-alert",
            duration: 2};
        var myAlert;
        var no_username = (username === undefined || username == '');
		var no_password = (password === undefined || password == '');
        if(no_username && no_password){
            $scope.alert.content = 'Please enter your information.';
            myAlert = $alert($scope.alert);
            myAlert.show();
            console.log(myAlert);
		}else if(no_password){
            $scope.alert.content = 'Please enter your password.';
            myAlert = $alert($scope.alert);
            myAlert.show();
		}else if(no_username){
            $scope.alert.content = 'Please enter your username.';
            myAlert = $alert($scope.alert);
            myAlert.show();
		}else if (!no_username && !no_password) {
            UserService.logIn(username, password).success(function(data) {
				console.log("LIGGED INT");
                AuthenticationService.isAuthenticated = true;
                AuthenticationService.user = data.user.username;
                AuthenticationService.userRole = data.user.role;
                $window.sessionStorage.token = data.token;
                $window.sessionStorage.user = data.user.username; // to fetch the user details on refresh
                $window.sessionStorage.userRole = data.user.role; // to fetch the user details on refresh
				console.log(AuthenticationService);

                $location.path("/");
            }).error(function(status, data) {
				console.log("SOERROR");
                $scope.alert.content = status;
                myAlert = $alert($scope.alert);
                myAlert.show();
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
				$location.path("/login");
			}).error(function(status, data) {
				console.log(status);
				console.log(data);
			});
		}
		else {
			$location.path("/login");
		}
    }

	$scope.register = function register(username, email, name) {
		if (AuthenticationService.isAuthenticated) {
			$location.path("/");
		}
		else {
			UserService.register(username, email, name).success(function(data) {
				$scope.alert = {content: '[repl]', type: 'success',
					container: "#signup-alert",
					duration: 2};
				$scope.alert.content = 'Signed up! Check your email for your password.';
				myAlert = $alert($scope.alert);
				myAlert.show();
				$location.path("/");
			}).error(function(status, data) {
				$scope.alert = {content: '[repl]', type: 'danger',
					container: "#signup-alert",
					duration: 2};
				$scope.alert.content = 'Error! Contact Luke.';
				myAlert = $alert($scope.alert);
				myAlert.show();
				console.log(status);
				console.log(data);
			});
		}
	};
    $scope.token = $localStorage.token;
    console.log($window.sessionStorage.data);



}]).factory('UserService', function ($http, $window, AuthenticationService) {
	return {
		logIn: function(username, password) {
			return $http.post('/login', {username: username, password: password});
		},

		logOut: function() {
            if (AuthenticationService.isAuthenticated) {

                AuthenticationService.isAuthenticated = false;
                delete AuthenticationService.user;
                delete AuthenticationService.userRole;

                delete $window.sessionStorage.token;
                delete $window.sessionStorage.user;
                delete $window.sessionStorage.userRole;

                //$location.path("/login");
                return $http.get('/logout');
            }

		},

		register: function(username, email, name) {
			return $http.post( '/register', {username: username, email: email, name: name });
		}
	}
})