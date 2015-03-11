angular.module('NavBarCtrl',  ['bracketApp']).controller('NavBarController', ['$scope','UserService', 'AuthenticationService',  '$window', '$location', '$rootScope', function($scope, UserService, AuthenticationService,  $window, $location, $rootScope) {
	if($window.sessionStorage.token){
		AuthenticationService.isAuthenticated = true;
	}else{
		AuthenticationService.isAuthenticated = false;
	}
	$scope.isLoggedIn = AuthenticationService.isAuthenticated;
	$scope.$watch(function(){
		return AuthenticationService.isAuthenticated;
	}, function (newVal, oldVal) {
		$scope.isLoggedIn = AuthenticationService.isAuthenticated;
	});
    $scope.name = "MARCH MADNESS MADNESS 2015"

    $scope.logOut = function logout() {
        console.log("BYEBYE");
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

    $scope.startTutorial = function startTutorial(){
        $rootScope.$emit('start-tutorial', {
            name: 'Dwayne',
            country: 'Australia',
            email: 'somedude@example.com'
        });
    }

}]);