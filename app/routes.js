module.exports = function(app, passport) {
	app.all('/*', function(req, res, next) {
		console.log(req);
		var arbitraryUrls = ['partials', 'api'];
		if (arbitraryUrls.indexOf(req.url.split('/')[1]) > -1) {
			next();
		} else {
			console.log("NOPE");
			res.render('index');
		}
	});
	app.get('/', function(req, res){
		res.render('layout', { title: 'Express' });
	});

	// process the login form
	// app.post('/login', do all our passport stuff here);

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('partials/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('partials/signup', { message: req.flash('signupMessage') });
	});

	// process the signup form
	// app.post('/signup', do all our passport stuff here);

	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('partials/profile', isLoggedIn, function(req, res) {
		res.render('partials/profile', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});


	app.get('/partials/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('partials/login');
	});

	app.get('/partials/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('partials/signup');
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/partials/profile', // redirect to the secure profile section
		failureRedirect : '/partials/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	app.get('/partials/profile', isLoggedIn, function(req, res) {
		res.render('partials/profile', {
			user : req.user // get the user out of session and pass to template
		});
	});
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});



    app.get('/partials/*', function(req, res, next) {
        res.render('.' + req.path);
    });



};

function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}