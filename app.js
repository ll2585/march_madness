var express = require("express");
var routes = require("./app/routes");
var app = express();
var port = process.env.PORT || 3159;
var router = express.Router();
//***********************MONGODB OPTIONS********************
var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');

var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };

var mongodbUri = 'mongodb://luke:FTR93tcUeT7MjbS@ds062097.mongolab.com:62097/march-madness';
var mongooseUri = uriUtil.formatMongoose(mongodbUri);

var db;
var connected_to_db = false;
var Schema = mongoose.Schema;
mongoose.connect(mongooseUri, options);
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    connected_to_db = true;
});
var songSchema = Schema({
    decade: String,
    artist: String,
    song: String,
    weeksAtOne: Number
});
function insert_random_stuff() {
    // Create song schema

    // Store song documents in a collection called "songs"
    var Song = mongoose.model('songs', songSchema);

    // Create seed data
    var seventies = new Song({
        decade: '1970s',
        artist: 'Debby Boone',
        song: 'You Light Up My Life',
        weeksAtOne: 10
    });

    var eighties = new Song({
        decade: '1980s',
        artist: 'Olivia Newton-John',
        song: 'Physical',
        weeksAtOne: 10
    });

    var nineties = new Song({
        decade: '1990s',
        artist: 'Mariah Carey',
        song: 'One Sweet Day',
        weeksAtOne: 16
    });

    /*
     * First we'll add a few songs. Nothing is required to create the
     * songs collection; it is created automatically when we insert.
     */
    seventies.save();
    eighties.save();
    nineties.save();

    /*
     * Then we need to give Boyz II Men credit for their contribution
     * to the hit "One Sweet Day".
     */
    Song.update({song: 'One Sweet Day'}, {$set: {artist: 'Mariah Carey ft. Boyz II Men'}},
        function (err, numberAffected, raw) {

            if (err) return handleError(err);

            /*
             * Finally we run a query which returns all the hits that spend 10 or
             * more weeks at number 1.
             */
            Song.find({weeksAtOne: {$gte: 10}}).sort({decade: 1}).exec(function (err, docs) {

                if (err) throw err;

                docs.forEach(function (doc) {
                    console.log(
                        'In the ' + doc['decade'] + ', ' + doc['song'] + ' by ' + doc['artist'] +
                        ' topped the charts for ' + doc['weeksAtOne'] + ' straight weeks.'
                    );
                });
            });
        }
    )
}
//******************************************************

app.set('views', __dirname + '/views');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

app.use(express.static(__dirname + '/public'));

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

require('./app/routes')(app);
app.listen(port);
console.log("Listening on port " + port);