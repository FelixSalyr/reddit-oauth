const router = require('express').Router();
const passport = require('passport');
const crypto = require('crypto');
const KEYS = require('./keys');

// auth with Reddit
router.get('/reddit', function(req, res, next){
    req.session.state = crypto.randomBytes(32).toString('hex');
    passport.authenticate('reddit', {
            state: req.session.state,
        })(req, res, next);
});

// redirect to React home page after successful login via Reddit
router.get('/reddit/redirect', 
    passport.authenticate('reddit', { 
            successRedirect: '/',//`${KEYS.REACT_APP_HOSTNAME}:${KEYS.REACT_APP_PORT}`, 
            failureRedirect: '/auth/login/failed'
        })
);

// when login is successful, retrieve user info
router.get("/login/success", ensureAuthenticated, (req, res) => {
    res.json({
        authenticated: true,
        message: "user has successfully authenticated",
        user: req.user,
        cookies: req.cookies
    });
});

  // when login failed, send failed msg
router.get("/login/failed", (req, res) => {
    res.status(401).json({
        authenticated: false,
        message: "user failed to authenticate."
    });
});

router.get('./logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    // if (req.isAuthenticated()) { return next(); }
    // res.redirect('/login');
    if (!req.user) {
        res.status(401).json({
            authenticated: false,
            message: "user has not been authenticated"
        });
    } else {
        next();
    }
}

module.exports = router;