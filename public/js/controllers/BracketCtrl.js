angular.module('BracketCtrl', []).controller('BracketController', ['$scope', function($scope) {
	function getNextRound(round, matchup, region){
		var next_team = matchup % 2 == 0 ? 2 : 1;
		var next_round = round + 1;
		var next_matchup = matchup % 2 == 0 ? matchup / 2 : (matchup + 1)/2;
		var next_elem;
		if(next_round == 5){
			next_elem = angular.element( document.querySelector( '#region-' +region+ "-winner" ) );
		}else if(next_round == 6){
			var finals_round = ((region+1) % 2)+1;
			next_elem = angular.element( document.querySelector( '#finals-' + finals_round) ); //1,3->1, 2,4->2
		}else if(next_round == 7){
			next_elem = angular.element( document.querySelector( '#champion' ) );
		}else{
			next_elem = angular.element( document.querySelector( '#team-' + next_team + "-region-" + region + "-round-" + next_round + "-matchup-" + next_matchup ) );
		}

		return {exists: next_elem.length > 0, next_elem: next_elem, next_round: next_round, next_matchup: next_matchup, next_team: next_team, next_region: region};
	}

	function getOtherTeam(round, matchup, team, region){
		var other_team = (team % 2) + 1; //1->2, 2->1
		var other_team_elem;
		if(round == 5){
			other_team_elem = angular.element( document.querySelector( '#region-' +(region%4+2)+ "-winner" ) );
		}else if(round == 6){
			other_team_elem = angular.element( document.querySelector( '#finals-' + other_team ) );
		}else if(round == 7){
			other_team_elem = null;
		}else{
			other_team_elem = angular.element( document.querySelector( '#team-' + other_team + "-region-" + region + "-round-" + round + "-matchup-" + matchup ) );
		}

		return other_team_elem;
	}
	$scope.tagline = 'Nothing beats a pocket protector!';
	$scope.selectChampions = function($event, data) {

	}
	$scope.select = function($event, data) {
		var next_elem = getNextRound(data['round'], data['matchup'], data['region']);
		var my_text = angular.element($event.target).text();
		var other_team_elem = getOtherTeam(data['round'], data['matchup'], data['team'], data['region']);
		var changed_team = next_elem['next_elem'].text() != '' && next_elem['next_elem'].text() != angular.element($event.target).text();
		var old_team = next_elem['next_elem'].text();
		if(other_team_elem.text() != ''){
			other_team_elem.removeClass('team-selectable');
			other_team_elem.addClass('team-chosen-to-lose');
		}
		next_elem['next_elem'].text(my_text);
		next_elem['next_elem'].addClass('team-selectable');
		angular.element($event.target).removeClass('team-chosen-to-lose');
		angular.element($event.target).addClass('team-selectable');
		next_elem['next_elem'].removeClass('team-chosen-to-lose');


		if(changed_team){
			var next_elem_next_change = next_elem;
			var otherTeamIterOne = getOtherTeam(next_elem_next_change['next_round'], next_elem_next_change['next_matchup'], next_elem_next_change['next_team'], next_elem_next_change['next_region']);
			console.log(otherTeam);
			if(otherTeamIterOne.text() != ''){
				otherTeamIterOne.addClass('team-selectable');
				otherTeamIterOne.removeClass('team-chosen-to-lose');
			}
			while(next_elem_next_change['exists']) {
				next_elem_next_change = getNextRound(next_elem_next_change['next_round'], next_elem_next_change['next_matchup'], next_elem_next_change['next_region']);
				if(next_elem_next_change['next_elem'].text() == old_team) {
					next_elem_next_change['next_elem'].text('');
					next_elem_next_change['next_elem'].removeClass('team-selectable');
					var otherTeam = getOtherTeam(next_elem_next_change['next_round'], next_elem_next_change['next_matchup'], next_elem_next_change['next_team'], next_elem_next_change['next_region']);
					console.log(otherTeam);
					if(otherTeam.text() != ''){
						otherTeam.addClass('team-selectable');
						otherTeam.removeClass('team-chosen-to-lose');
					}
				}
			}
		}

		var next_elem_next_elem = getNextRound(next_elem['next_round'], next_elem['next_matchup'], next_elem['next_region']);

		console.log(next_elem_next_elem);
		if(next_elem_next_elem['exists'] && next_elem_next_elem['next_elem'].text() != '' && next_elem_next_elem['next_elem'].text() != my_text){
			next_elem['next_elem'].addClass('team-chosen-to-lose');
			next_elem['next_elem'].removeClass('team-selectable');
		}


	};

}]);