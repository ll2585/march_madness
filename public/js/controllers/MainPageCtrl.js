angular.module('MainPageCtrl', ['bm.bsTour']).controller('MainPageController', ['$rootScope', '$scope', 'userInfoFactory', '$window', function($rootScope, $scope, userInfoFactory, $window) {

	$scope.tagline = 'To the moon and back!';

    $rootScope.$on('start-tutorial', function(event, obj){
        console.log("HI!");
    });

    $scope.getFlags = function(){
        if(!$window.sessionStorage.userFlags){
            userInfoFactory.getFlags($window.sessionStorage.token, $window.sessionStorage.user).then(function(data) {
                $scope.userInfo = data.data;
                $scope.skipped_main_page = data.data.skipped_main_page;
                $window.sessionStorage.data = data.data;
            });
        }
    };

    $scope.getFlags();
    $rootScope.$on('start-tour', function(event, obj){
        obj.tour.restart();
    });

}]).factory('userInfoFactory', function($http) {
    /** https://docs.angularjs.org/guide/providers **/
    var urlBase = '';
    var userInfoFactory = {};

    userInfoFactory.getFlags = function(token, username) {
        return $http({
            url: '/getFlags', method: "GET", params: {token: token, username: username}
        });
    };

    return userInfoFactory;
})