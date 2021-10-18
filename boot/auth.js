var passport = require('passport');
const RedditStrategy = require('passport-reddit').Strategy;
const KEYS = require("../keys");
//const User = require("../models/user-model");

    // Passport session setup.
    //   To support persistent login sessions, Passport needs to be able to
    //   serialize users into and deserialize users out of the session.  Typically,
    //   this will be as simple as storing the user ID when serializing, and finding
    //   the user by ID when deserializing.  However, since this example does not
    //   have a database of user records, a simple user object is stored instead
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
    //   callbackURL must match redirect uri from your reddit authorized app settings
    passport.use(new RedditStrategy({
        clientID: KEYS.REDDIT_CONSUMER_KEY,
        clientSecret: KEYS.REDDIT_CONSUMER_SECRET,
        callbackURL: `http://${KEYS.ENV_DEV_HOSTNAME}:${KEYS.ENV_PORT}/auth/reddit/redirect`
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            var user = {
                "accessToken": accessToken,
                "refreshToken": refreshToken,
                "profileId": profile.id,
                "name": profile.name
            }
            // To keep the example simple, the user's Reddit profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Reddit account with a user record in your database,
            // and return that user instead.
            return done(null, user);
        });
    }
    ));