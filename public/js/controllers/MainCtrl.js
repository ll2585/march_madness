angular.module('MainCtrl', []).controller('MainController', ['$rootScope', '$scope', '$location', '$localStorage', '$window', 'UserService', 'AuthenticationService', function($rootScope, $scope, $location, $localStorage, $window, UserService, AuthenticationService) {

	$scope.tagline = 'To the moon and back!';

    $scope.logIn = function logIn(username, password) {
        if (username !== undefined && password !== undefined) {

            UserService.logIn(username, password).success(function(data) {
                AuthenticationService.isLogged = true;
                $window.sessionStorage.token = data.token;
                $location.path("/admin");
            }).error(function(status, data) {
                console.log(status);
                console.log(data);
            });
        }
    }

    $scope.logout = function logout() {
        if (AuthenticationService.isLogged) {
            AuthenticationService.isLogged = false;
            delete $window.sessionStorage.token;
            $location.path("/");
        }
    }
    $scope.token = $localStorage.token;
}]).factory('Main', ['$http', '$localStorage', function($http, $localStorage){
    var baseUrl = "";
    function changeUser(user) {
        angular.extend(currentUser, user);
    }

    function urlBase64Decode(str) {
        var output = str.replace('-', '+').replace('_', '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw 'Illegal base64url string!';
        }
        return window.atob(output);
    }

    function getUserFromToken() {
        var token = $localStorage.token;
        var user = {};
        if (typeof token !== 'undefined') {
            var encoded = token.split('.')[1];
            user = JSON.parse(urlBase64Decode(encoded));
        }
        return user;
    }

    var currentUser = getUserFromToken();

    return {
        save: function(data, success, error) {
            $http.post(baseUrl + '/signin', data).success(success).error(error)
        },
        signin: function(data, success, error) {
            console.log(data);
            $http.post(baseUrl + '/authenticate', data).success(success).error(error)
            console.log("SUCCESS?");
        },
        me: function(success, error) {
            $http.get(baseUrl + '/me').success(success).error(error)
        },
        logout: function(success) {
            changeUser({});
            delete $localStorage.token;
            success();
        }
    };
}
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
                $location.path("/admin/login");
            }

            return $q.reject(rejection);
        }
    };
}).factory('UserService', function ($http) {
    return {
        signIn: function(username, password) {
            return $http.post(options.api.base_url + '/user/signin', {username: username, password: password});
        },

        logOut: function() {
            return $http.get(options.api.base_url + '/user/logout');
        },

        register: function(username, password, passwordConfirmation) {
            return $http.post(options.api.base_url + '/user/register', {username: username, password: password, passwordConfirmation: passwordConfirmation });
        }
    }
});