// Cobbled together using Passport's Reddit oAuth2 example
// https://github.com/Slotos/passport-reddit/tree/master/examples/login
// and with AWS' Elastic Beanstalk demo project
var cluster = require('cluster'),
    express = require('express'),
    passport = require('passport'),
    util = require('util'),
    crypto = require('crypto'),
    RedditStrategy = require('passport-reddit').Strategy;

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
    var AWS = require('aws-sdk');
    var express = require('express');
    var bodyParser = require('body-parser');

    AWS.config.region = process.env.REGION

    var sns = new AWS.SNS();
    var ddb = new AWS.DynamoDB();

    var ddbTable =  process.env.STARTUP_SIGNUP_TABLE;
    var snsTopic =  process.env.NEW_SIGNUP_TOPIC;
    const hostname = '127.0.0.1';
    const port = process.env.PORT || 3000;

    var REDDIT_CONSUMER_KEY = "--insert-reddit-consumer-key-here--";
    var REDDIT_CONSUMER_SECRET = "--insert-reddit-consumer-secret-here--";
    
    // Passport session setup.
    //   To support persistent login sessions, Passport needs to be able to
    //   serialize users into and deserialize users out of the session.  Typically,
    //   this will be as simple as storing the user ID when serializing, and finding
    //   the user by ID when deserializing.  However, since this example does not
    //   have a database of user records, the complete Reddit profile is
    //   serialized and deserialized.
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
  
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    // Use the RedditStrategy within Passport.
    //   Strategies in Passport require a `verify` function, which accept
    //   credentials (in this case, an accessToken, refreshToken, and Reddit
    //   profile), and invoke a callback with a user object.
    //   callbackURL must match redirect uri from your app settings
    passport.use(new RedditStrategy({
        clientID: REDDIT_CONSUMER_KEY,
        clientSecret: REDDIT_CONSUMER_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/reddit/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // To keep the example simple, the user's Reddit profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Reddit account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }
    ));

    var app = express();

    // configure Express

    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/', function(req, res){
        res.render('index', { user: req.user });
    });

    app.get('/account', ensureAuthenticated, function(req, res){
        res.render('account', { user: req.user });
    });
      
    app.get('/login', function(req, res){
        res.render('login', { user: req.user });
    });

    // GET /auth/reddit
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in Reddit authentication will involve
    //   redirecting the user to reddit.com.  After authorization, Reddit
    //   will redirect the user back to this application at /auth/reddit/callback
    //
    //   Note that the 'state' option is a Reddit-specific requirement.
    app.get('/auth/reddit', function(req, res, next){
        req.session.state = crypto.randomBytes(32).toString('hex');
        passport.authenticate('reddit', {
                state: req.session.state,
            })(req, res, next);
    });

    // GET /auth/reddit/callback
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function function will be called,
    //   which, in this example, will redirect the user to the home page.
    app.get('/auth/reddit/callback', function(req, res, next){
        // Check for origin via state token
        if (req.query.state == req.session.state){
            passport.authenticate('reddit', {
                successRedirect: '/',
                failureRedirect: '/login'
            })(req, res, next);
        }
        else {
            next( new Error(403) );
        }
    });

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    var server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });

    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed.  Otherwise, the user will be redirected to the
    //   login page.
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/login');
    }
}


