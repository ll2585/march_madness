angular.module('MiniGameController', []).controller('MiniGameController', ['$rootScope', '$scope', 'userInfoFactory', '$window', '$q', '$http', '$sce', function($rootScope, $scope, userInfoFactory, $window, $q, $http, $sce) {
	$scope.said_yes_to_playing_minigame = null;

	$scope.signup = function(agree){
		userInfoFactory.sendFlags($window.localStorage.token, $window.localStorage.user, 'said_yes_to_playing_minigame', agree);
		$scope.said_yes_to_playing_minigame = agree;
		if(!agree){
			$scope.playerSucks();
		}
	}

	$scope.getFlags = function(){
		if(!$window.localStorage.userFlags){
			userInfoFactory.getFlags($window.localStorage.token, $window.localStorage.user).then(function(data) {
				$scope.said_yes_to_playing_minigame = data.data.said_yes_to_playing_minigame;
				if(data.data.said_yes_to_playing_minigame == false){
					$scope.playerSucks();
				}
			});
		}
	};

	$scope.playerSucks = function(){
		$scope.slides = [];
		var gifs = ['http://rack.1.mshcdn.com/media/ZgkyMDEzLzA3LzE4L2VkL2NyeWluZ3NsaWRlLmFhMWRjLmdpZgpwCXRodW1iCTEyMDB4OTYwMD4/64829b30/e38/crying-slide.gif',
			'http://rack.2.mshcdn.com/media/ZgkyMDEzLzA3LzE4LzE3L1N1cGVybmF0dXJhLjYzM2JmLmdpZgpwCXRodW1iCTEyMDB4OTYwMD4/6735d712/ab4/Supernatural-Dean.gif',
			'http://rack.2.mshcdn.com/media/ZgkyMDEzLzA3LzE4LzJjL0xvdmVhbmRPdGhlLmE1NTQ2LmdpZgpwCXRodW1iCTEyMDB4OTYwMD4/0fef7083/ee2/Love-and-Other-Drugs.gif',
			'http://rack.3.mshcdn.com/media/ZgkyMDEzLzA3LzE4LzI3L01vbnN0ZXJzSW5jLmYxNjdiLmdpZgpwCXRodW1iCTEyMDB4OTYwMD4/79861af1/1ea/Monsters-Inc.gif',
			'http://rack.3.mshcdn.com/media/ZgkyMDEzLzA3LzE4Lzc1L0RyLldoby41Mjg5ZC5naWYKcAl0aHVtYgkxMjAweDk2MDA-/571ec44d/6da/Dr.-Who.gif'];
		for (var i=0; i<gifs.length; i++) {
			$scope.slides.push({
				image: gifs[i]
			});
		}
	}




	$scope.getFlags()








	/////////////////////////////// for the real
	$scope.showRole = false;
}]);