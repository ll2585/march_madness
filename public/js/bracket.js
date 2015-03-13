angular.module('bracketApp', ['ngRoute', 'bracketRoutes', 'MainCtrl', 'BracketCtrl', 'BoxCtrlAngular', 'BracketCtrlAngular', 'NavBarCtrl', 'BracketService', 'BoxCtrl', 'BoxService', 'MiniGameCtrl', 'MiniGameService',
    'SideBarCtrl', 'ui.bootstrap', 'ngCookies', 'bm.bsTour', 'angularModalService', 'ngStorage', 'MessageCenterModule', 'mgcrea.ngStrap', 'MainPageCtrl', 'ngJoyRide','smart-table', 'ngSanitize', 'ngAnimate'
]).factory('AuthenticationService', function($window) {
	var auth = {
		isAuthenticated: false,
		isAdmin: false,
        check: function() {
            if ($window.sessionStorage.token && $window.sessionStorage.user) {
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
			if ($window.sessionStorage.token) {
				config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
			}
			return config;
		},

		requestError: function(rejection) {
			return $q.reject(rejection);
		},

		/* Set Authentication.isAuthenticated to true if 200 received */
		response: function (response) {
			if (response != null && response.status == 200 && $window.sessionStorage.token && !AuthenticationService.isAuthenticated) {
				AuthenticationService.isAuthenticated = true;
			}
			return response || $q.when(response);
		},

		/* Revoke client authentication if 401 is received */
		responseError: function(rejection) {
			if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || AuthenticationService.isAuthenticated)) {
				delete $window.sessionStorage.token;
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