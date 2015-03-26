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
    $scope.showAbility = false;
    $scope.init = function(){
        $http({
            url: '/getMiniGameRole.json', method: "GET", params: {username: $window.localStorage.user}
        }).success(function(data) {
			$http({
				url: '/getMiniGamePlayers.json', method: "GET", params: {username: $window.localStorage.user}
			}).success(function(players) {
				$scope.players = players;
				for(var i = 0 ; i < $scope.players.length; i++){
					console.log($scope.guessed_players)
					console.log($scope.players[i]);
					$scope.$watch('guessed_players["' + $scope.players[i] + '"]', function(newValue, oldValue){
						console.log("CHANGING GUESS OF " + $scope.players[i] + " FROM " + oldValue + " TO " + newValue)
						if(oldValue && oldValue != ''  && newValue !== null){
							$scope.guessed_roles[oldValue] = null
						}
					});
				}
			});
			$scope.myRoleName = data.role.name;
            if(data.actions_did.indexOf("robbed") > -1){
                $scope.roleinfo = "You WERE the robber. " + data.actions_did;
            }else{
                $scope.roleinfo = "You are the " + data.role.name + "."
            }
            $scope.roleinfo += " Your team is " + data.role.team + " and you are from the game " + data.role.game + ". Please check the index to see how you win.";
        });
    }

    $scope.blues = [
        {scoring_img_1: "/img/minigame/redbluescoring1.PNG", scoring_img_2: "/img/minigame/redbluescoring2.PNG", img: '/img/president.png', name: 'President', win_condition: "You are the head of the blue team. If you win, the blue team wins. You win if you can score three points. See below. If the Bomber guesses you, both you and the blue team will lose.  In order to win, you must guess the Doctor, as well as either A) Guess the Bomber, or B) Be more than three ranks away from the Bomber at the end."},
        {img: '/img/doctor.png', name: 'Doctor', win_condition: "You are the Doctor. You win if the President wins, and you guess the President."},
        {img: '/img/one_armed_man.png', name: 'One Armed Man', win_condition: "You are the One Armed Man. You win if the President wins or you guess the Witness. You lose if the Fugitive guesses you, even if you guess the Witness or the President wins."},
        {img: '/img/marshall.png', name: 'Marshall', win_condition: "You are the Marshall. You win if the President wins or you guess the Fugitive. You lose if the Witness guesses you, even if you guess the Fugitive or the President wins."}
    ]
    $scope.reds = [
        {scoring_img_1: "/img/minigame/redbluescoring1.PNG", scoring_img_2: "/img/minigame/redbluescoring2.PNG", img: '/img/bomber.png', name: 'Bomber', win_condition: "You are the head of the red team. If you win, the red team wins. You win if you can score three points. See below. If the president guesses you, both you and the red team will lose.  In order to win, you must guess the Engineer, as well as either A) Guess the President, or B) Be three ranks or fewer away from the President at the end."},
        {img: '/img/engineer.png', name: 'Engineer', win_condition: "You are the Engineer. You win if the Bomber wins, and you guess the Bomber."},
        {img: '/img/fugitive.png', name: 'Fugitive', win_condition: "You are the Fugitive. You win if the Bomber wins or you guess the One Armed Man. You lose if the Marshall guesses you, even if you guess the One Armed Man or the Bomber wins."},
        {img: '/img/witness.png', name: 'Witness', win_condition: "You are the Witness. You win if the Bomber wins or you guess the Marshall. You lose if the One Armed Man guesses you, even if you guess the Marshall or the Bomber wins."}
    ]
    $scope.village = [
        {scoring_img_1: "/img/minigame/werewolfscoring1.PNG", scoring_img_2: "/img/minigame/werewolfscoring2.PNG", img: '/img/seer.png', name: 'Seer', win_condition: "You are the Seer. You win if the Village wins. The Village wins if they can score three points. If they cannot, the Village loses. See the bottom graphic for how they can score points."},
        {scoring_img_1: "/img/minigame/werewolfscoring1.PNG", scoring_img_2: "/img/minigame/werewolfscoring2.PNG",  img: '/img/robber.png', name: 'Robber', win_condition: "You are the Robber. You win if the Village wins. The Village wins if they can score three points. If they cannot, the Village loses. See the bottom graphic for how they can score points."},
        {scoring_img_1: "/img/minigame/werewolfscoring1.PNG", scoring_img_2: "/img/minigame/werewolfscoring2.PNG",  img: '/img/troublemaker.png', name: 'Troublemaker', win_condition: "You are the Troublemaker. You win if the Village wins. The Village wins if they can score three points. If they cannot, the Village loses. See the bottom graphic for how they can score points."},
    ]
    $scope.werewolves = [
        {scoring_img_1: "/img/minigame/werewolfscoring1.PNG", scoring_img_2: "/img/minigame/werewolfscoring2.PNG",  img: '/img/werewolf1.png', name: 'Werewolf 1', win_condition: "You are Werewolf 1. You win if the Werewolves win. The Werewolves win if they can score three points. If they cannot, the Werewolves lose. See the bottom graphic for how they can score points."},
        {scoring_img_1: "/img/minigame/werewolfscoring1.PNG", scoring_img_2: "/img/minigame/werewolfscoring2.PNG",  img: '/img/werewolf2.png', name: 'Werewolf 2', win_condition: "You are Werewolf 2. You win if the Werewolves wins. The Werewolves win if they can score three points. If they cannot, the Werewolves lose. See the bottom graphic for how they can score points."},
        {scoring_img_1: "/img/minigame/werewolfscoring1.PNG", scoring_img_2: "/img/minigame/werewolfscoring2.PNG",  img: '/img/minion.png', name: 'Minion', win_condition: "You are the Minion. You win if the Werewolves win. The Werewolves win if they can score three points. If they cannot, the Werewolves lose. See the bottom graphic for how they can score points."},
    ]

	$scope.allRoles = [];
	for(var i = 0; i <  $scope.blues.length; i++){
		$scope.allRoles.push($scope.blues[i])
	}
	for(var i = 0; i <  $scope.reds.length; i++){
		$scope.allRoles.push($scope.reds[i])
	}
	for(var i = 0; i <  $scope.village.length; i++){
		$scope.allRoles.push($scope.village[i])
	}
	for(var i = 0; i <  $scope.werewolves.length; i++){
		$scope.allRoles.push($scope.werewolves[i])
	}
	$scope.guessed_players = {};
	$scope.guessed_roles = {};

    $scope.winDescription = "";
    $scope.show_conditions = false;

    $scope.showDescription = function(p){
        $scope.winDescription = p.win_condition;
        $scope.selected = p;
    }
	$scope.selected = null;

    $scope.init();

	$scope.guess = function(p, r, oldp, oldr){
		console.log(oldp);
		console.log(oldr);
		console.log($scope.guessed_players)
		$scope.guessed_roles[r] = p;
		$scope.guessed_players[p] = r;
	}

	for(var i = 0 ; i < $scope.allRoles.length; i++){
		$scope.$watch('guessed_roles["' + $scope.allRoles[i].name + '"]', function(newValue, oldValue){
			console.log("NEW ROLE" + newValue + "OLD VAL " + oldValue)
			if(oldValue && oldValue != '' && newValue !== null){

				$scope.guessed_players[oldValue] = null
			}
		});
	}

	$scope.alreadyGuessed = function(p, r){
		if(p){
			return (p in $scope.guessed_players && $scope.guessed_players[p] != null);
		}
		if(r){
			return (r in $scope.guessed_roles && $scope.guessed_roles[r] != null);
		}
	}



}]);