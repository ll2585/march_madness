angular.module('AdminController',  []).controller('AdminController', ['$scope',  '$window','$rootScope', '$http', function($scope, $window, $rootScope, $http) {

    $scope.hi = "HI LUKE YOU ARE THE BEST"

    $scope.init = function(){
        $http.get("/admin/bracket-status").success(function(data){
            $scope.brackets_opened = data['brackets_opened'];

        }).error(function(){
            console.log("No data");
        });
    }

    $scope.init();
  }]);