angular.module('bracketApp', ['ngRoute', 'bracketRoutes', 'MainCtrl', 'BoxCtrlAngular', 'MiniGameController', 'BracketCtrlAngular', 'OfficialBracketCtrlAngular', 'NavBarCtrl', 'AchievementCtrl',
    'SideBarCtrl', 'ui.bootstrap', 'ngCookies', 'ngStorage', 'mgcrea.ngStrap', 'MainPageCtrl', 'ngJoyRide','smart-table', 'ngSanitize'
]).factory('AuthenticationService', function($window) {
	var auth = {
		isAuthenticated: false,
		isAdmin: false,
        check: function() {
            if ($window.localStorage.token && $window.localStorage.user) {
                this.isLogged = true;
            } else {
                this.isLogged = false;
                delete this.user;
            }
        }
	}

	return auth;
}).factory('TokenInterceptor', function ($q, $window, $location, AuthenticationService) {
	return {
		request: function (config) {
			config.headers = config.headers || {};
			if ($window.localStorage.token) {
				config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
			}
			return config;
		},

		requestError: function(rejection) {
			return $q.reject(rejection);
		},

		/* Set Authentication.isAuthenticated to true if 200 received */
		response: function (response) {
			if (response != null && response.status == 200 && $window.localStorage.token && !AuthenticationService.isAuthenticated) {
				AuthenticationService.isAuthenticated = true;
			}
			return response || $q.when(response);
		},

		/* Revoke client authentication if 401 is received */
		responseError: function(rejection) {
			if (rejection != null && rejection.status === 401 && ($window.localStorage.token || AuthenticationService.isAuthenticated)) {
				delete $window.localStorage.token;
				AuthenticationService.isAuthenticated = false;
				$location.path("/login");
			}

			return $q.reject(rejection);
		}
	};
}).factory('userInfoFactory', function($http) {
	/** https://docs.angularjs.org/guide/providers **/
	var urlBase = '';
	var userInfoFactory = {};

	userInfoFactory.getFlags = function(token, username) {
		return $http({
			url: '/getFlags', method: "GET", params: {token: token, username: username}
		});
	};

	userInfoFactory.sendFlags = function(token, username, flag, val) {
		return $http.post( '/setFlags', {username: username, token: token, flag: flag, val: val });
	};

	return userInfoFactory;
});