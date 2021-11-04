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
        passport = require('passport'),
        expressLayouts = require('express-ejs-layouts'),
        authRoutes = require('./auth-routes');
        historyRoutes = require('./reddit/history-routes');
        const KEYS = require('./keys');
        const cors = require('cors');
        const cookieSession = require("cookie-session");
        const cookieParser = require("cookie-parser");
        const ensureAuthenticated = require('./utils/ensureAuthenticated');

    AWS.config.region = process.env.REGION

    var sns = new AWS.SNS();
    var ddb = new AWS.DynamoDB();

    var ddbTable =  process.env.STARTUP_SIGNUP_TABLE;
    var snsTopic =  process.env.NEW_SIGNUP_TOPIC;
    const hostname = 'localhost'; 
    const port = process.env.PORT || KEYS.ENV_PORT;

    var app = express();

    // Run boot setup files
    require('./boot/auth')();

    // configure Express
    app.use(express.json());
    // Session storage in a cookie
    app.use(cookieSession({
        name: "session",
        keys: [KEYS.COOKIE_KEY],
        maxAge: 24 * 60 * 60 * 100 // 24 hours in ms
    }))
    app.use(cookieParser());
    // set up cors to allow us to accept requests from our client
    app.use(
        cors({
        origin: `http://${KEYS.REACT_APP_HOSTNAME}:${KEYS.REACT_APP_PORT}`, // allow to server to accept request from different origin
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true // allow session cookie from browser to pass through
        })
    );
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

    app.get('/logout', function(req, res, next) {
        req.logout();
        res.redirect('/');
    });
    
    app.use('/auth', authRoutes);
    app.use('/history', historyRoutes);

    var server = app.listen(port, function () {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}


