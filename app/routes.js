module.exports = function(app) {
	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex ;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}
	var winning_numbers = [];
	var losing_numbers = [];
	for(var i = 0; i < 6; i++) {
		winning_numbers.push(shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));
		losing_numbers.push(shuffle([0, 9, 8, 7, 6, 5, 4, 3, 2, 1]));
	}
	var users = ["Luke", "Dean", "Liana", "Jenny", "Steve", "Jolyn"];
	var boxes = [];
	while(boxes.length < 100){
		if(100-boxes.length < users.length){ //not even so fill with no one
			boxes.push("None");
		}else{
			for(var j = 0 ; j < users.length; j++){
				boxes.push(users[j]);
			}
		}
	}
	shuffle(boxes);
	app.get('/boxes.json', function(req, res, next) {
		var json = {winning_numbers: winning_numbers, losing_numbers: losing_numbers, users: users};
		res.json(json);
	});
	app.all('/*', function(req, res, next) {
		var arbitraryUrls = ['partials', 'api'];
		if (arbitraryUrls.indexOf(req.url.split('/')[1]) > -1) {
			next();
		} else {
			res.render('index');
		}
	});

	app.get('/partials/box', function(req, res, next) {
		res.render('.' + req.path, {winning_numbers: winning_numbers, losing_numbers: losing_numbers, boxes: boxes, curUser: "Luke"});
	});
	app.get('/partials/*', function(req, res, next) {
		res.render('.' + req.path);
	});
};