// Cobbled together using Passport's Reddit oAuth2 example
// https://github.com/Slotos/passport-reddit/tree/master/examples/login
// and with AWS' Elastic Beanstalk demo project
// and https://medium.com/free-code-camp/how-to-set-up-twitter-oauth-using-passport-js-and-reactjs-9ffa6f49ef0
var cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for terminating workers
    cluster.on('exit', function (worker) {

        // Replace the terminated workers
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

// Code to run if we're in a worker process
} else {
    var AWS = require('aws-sdk'),
        express = require('express'),
        bodyParser = require('body-parser'),
        passport = require('passport'),
        util = require('util'),
        crypto = require('crypto'),
        session = require('express-session'),
        expressLayouts = require('express-ejs-layouts'),
        RedditStrategy = require('passport-reddit').Strategy,
        authRoutes = require('./auth-routes');
        const KEYS = require('./keys');
        const passportSetup = require ("./boot/auth");
        const cookieSession = require("cookie-session");
        const cookieParser = require("cookie-parser");

    AWS.config.region = process.env.REGION

    var sns = new AWS.SNS();
    var ddb = new AWS.DynamoDB();

    var ddbTable =  process.env.STARTUP_SIGNUP_TABLE;
    var snsTopic =  process.env.NEW_SIGNUP_TOPIC;
    const hostname = 'localhost'; 
    const port = process.env.PORT || 3000;

    var REDDIT_CONSUMER_KEY = "HpZvczyMWy9y_nRvsUpVBQ";
    var REDDIT_CONSUMER_SECRET = "IYSuPWHgKnl9CgwQCNLCEWO29x_cwA";

    var app = express();

    // configure Express
    app.use(express.json());
    // Session storage in a cookie
    app.use(cookieSession({
        name: "session",
        keys: [KEYS.COOKIE_KEY],
        maxAge: 24 * 60 * 60 * 100 // 24 hours in ms
    }))
    app.use(cookieParser());
    // Set Templating Engine
    app.use(expressLayouts);
    app.set('views', __dirname + '/views');
    app.set('layout', './layouts/layout');
    app.set('view engine', 'ejs')
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());

    // Test Routes (To be removed)
    app.get('/', function(req, res){
        res.render('index', { user: req.user });
    });

    app.get('/account', ensureAuthenticated, function(req, res){
        res.render('account', { user: req.user });
    });
      
    app.get('/login', function(req, res){
        res.render('login', { user: req.user });
    });
    
    app.use('/auth', authRoutes);

    var server = app.listen(port, function () {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}


