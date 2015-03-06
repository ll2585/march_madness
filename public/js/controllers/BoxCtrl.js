angular.module('BoxCtrl', []).controller('BoxController', ['$scope', function($scope) {

	$scope.tagline = 'The square root of life is pi!';	

}]).directive('rotateMe', function($timeout) {

	return {
		link: function (scope, element, attrs) {
			$timeout(function () {
				$timeout(function () {
					// This code will run after
					// templateUrl has been loaded, cloned
					// and transformed by directives.
					// and properly rendered by the browser
					var myDimens = element[0].getBoundingClientRect();
					var parent = angular.element( document.querySelector( '#' + attrs.myParent ) );
					var container = angular.element( document.querySelector( '.container' ) );

					var parentDimens = parent[0].getBoundingClientRect();
					if(myDimens.height > parentDimens.height){
						parent.css({
							'height': myDimens.height
						});
					}

					element.css({
						'background-color': 'green',
						left: parent[0].getBoundingClientRect().left ,
						top:  parent[0].getBoundingClientRect().top + parent[0].getBoundingClientRect().height/2 + myDimens.height/2
					});
					parent.css({
						//'width': myDimens.width
						'width': "20px" //f it otherwise it becomes 1000
					});
				}, 0);
			}, 0);


		}
	}
}).directive('rotateMe45', function($timeout) {

	return {
		link: function (scope, element, attrs) {
			var oldDimens = element[0].getBoundingClientRect();
			$timeout(function () {
				$timeout(function () {
					// This code will run after
					// templateUrl has been loaded, cloned
					// and transformed by directives.
					// and properly rendered by the browser
					//console.log(attrs.myParent);
					var parent = angular.element( document.querySelector( '#' + attrs.myParent ) );
					var losingTeamWidth = angular.element( document.querySelector( '#losing-label' ))[0].getBoundingClientRect().width;
					var parentDimens = parent[0].getBoundingClientRect();
					var round = attrs.myOffset;
					//console.log(parentDimens);
					var myDimens = element[0].getBoundingClientRect();
					var myDiagonal = 34; //calculated - i forgot how, something about the diagonal and the height
					//first we need to calculate how much padding we need...
					var hypotenuse = myDiagonal *(5-round+1)*Math.sqrt(2);//5-round+1 is because it goes 6,5,4,3,2,1 and the rounds go 0,1,2,3,4,5
					var cur_length = 8; //i just know it was 8 ... (went into chrome and saw the height)
					//console.log(myDimens);
					var new_padding = (hypotenuse - cur_length)/2;
					element.css({
						'top': parentDimens.top + myDiagonal + (5-round)*myDiagonal, //to make it move into the center of the box
						'left': parentDimens.left + losingTeamWidth + round * myDiagonal , //to make it move into the center of the box
						'padding-left': new_padding, //to extend the line
						'padding-right': new_padding
					});
					//console.log(myDimens);
				}, 0);
			}, 0);


		}
	}
});