angular.module('bracketApp', ['ngRoute', 'bracketRoutes', 'MainCtrl', 'BracketCtrl', 'BoxCtrlAngular', 'BracketCtrlAngular', 'NavBarCtrl', 'BracketService', 'BoxCtrl', 'BoxService', 'MiniGameCtrl', 'MiniGameService',
    'SideBarCtrl', 'ui.bootstrap', 'ngCookies', 'bm.bsTour', 'angularModalService', 'ngStorage', 'MessageCenterModule'
]).factory('AuthenticationService', function() {
	var auth = {
		isAuthenticated: false,
		isAdmin: false
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
});