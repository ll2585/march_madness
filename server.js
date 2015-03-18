var express = require("express");
var app = express();
var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3159;
//var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

var passport = require('passport');

var path           = require('path');
var methodOverride = require('method-override');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

//***********************MONGODB OPTIONS********************
var configDB = require('./config/db.js');
var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');

if (process.env.NODE_ENV == "production")
{
    console.log("PROD")
    mongoose.connect(uriUtil.formatMongoose(configDB['url'])); //THISLISTENS TO PORT ALREADY LOL DO THIS AFTER AUTH
}
else if (process.env.NODE_ENV == "development")
{
    console.log("DEV")
    mongoose.connect(uriUtil.formatMongoose(configDB['local_url'])); //THISLISTENS TO PORT ALREADY LOL DO THIS AFTER AUTH
}



var MongoStore = require('connect-mongo')(session);

app.use(session({
    secret: 'foo',
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));


//require('./config/passport')(passport); // pass passport for configuration
//******************************************************
// set up our express application
app.use(morgan('dev')); // log every request to the console


app.use(cookieParser()); // read cookies (needed for auth)

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

app.set('views', path.join(__dirname, '/views')); // Convenience since it's the fault anyway.
app.set('view engine', 'jade');
// routes ======================================================================
require('./app/routes')(app, passport); // load our routes and pass in our app and fully configured passport


var setUpServer = require('./setupServer.js');
setUpServer.insertSettingsIntoMongo();
app.listen(port);
console.log("Listening on port " + port);