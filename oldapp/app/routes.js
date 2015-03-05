module.exports = function(app, passport) {

    app.all('/*', function(req, res, next) {
        var arbitraryUrls = ['partials', 'api'];
        if (arbitraryUrls.indexOf(req.url.split('/')[1]) > -1) {
            next();
        } else {
            res.render('index');
        }
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