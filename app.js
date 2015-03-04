var express = require("express");
var app = express();
var port = process.env.PORT || 3159;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

//***********************MONGODB OPTIONS********************
var configDB = require('./config/database.js');
var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');

var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };

mongoose.connect(uriUtil.formatMongoose(configDB.url), options);

require('./config/passport')(passport); // pass passport for configuration
//******************************************************
// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json());
app.use(express.static( __dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

app.use(session({ secret: 'ilovescotchscotchyscotchscotch' ,
	saveUninitialized: true,
	resave: true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
app.get('/', function(req, res){
	res.render('mainPage', { title: 'Express' });
});
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


//***********************MAIL OPTIONS********************

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('-59uSm4adAh5BPLrjSVqwQ');

function send_mail(){
    var message = {
        "from_email":"ll02012@gmail.com",
        "to":[{"email":"ll02012@gmail.com"}],
        "subject": "Sending a text email from the Mandrill API",
        "text": "I'm learning the Mandrill API at Codecademy."
    };
    mandrill_client.messages.send({"message": message}, function(result) {
        console.log(result);
        /*
         [{
         "email": "recipient.email@example.com",
         "status": "sent",
         "reject_reason": "hard-bounce",
         "_id": "abc123abc123abc123abc123abc123"
         }]
         */
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
}
//******************************************************

app.listen(port);
console.log("Listening on port " + port);