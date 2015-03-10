angular.module('NavBarCtrl',  ['bracketApp']).controller('NavBarController', ['$scope','UserService', 'AuthenticationService',  '$window', function($scope, UserService, AuthenticationService,  $window) {
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

}]);