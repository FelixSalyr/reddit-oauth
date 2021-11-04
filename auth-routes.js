const router = require('express').Router();
const passport = require('passport');
const crypto = require('crypto');
const KEYS = require('./keys');
const ensureAuthenticated = require('./utils/ensureAuthenticated');

// auth with Reddit
router.get('/reddit', function(req, res, next){
    req.session.state = crypto.randomBytes(32).toString('hex');
    passport.authenticate('reddit', {
            state: req.session.state,
            duration: 'temporary',
            scope: 'identity history'
        })(req, res, next);
});

// redirect to React home page after successful login via Reddit
router.get('/reddit/redirect', (req, res, next) => {
    // Reddit API suggests that you verify the state values are the same
    if(req.query.state === req.session.state)
        passport.authenticate('reddit', { 
            successRedirect: `http://${KEYS.REACT_APP_HOSTNAME}:${KEYS.REACT_APP_PORT}`, 
            failureRedirect: '/auth/login/failed'
        })(req, res, next);
    else
        next(new Error(403));
    }
);

// when login is successful, retrieve user info
router.get("/login/success", ensureAuthenticated, (req, res) => {
    res.json({
        authenticated: true,
        message: "user has successfully authenticated",
        user: {name: req.user.name, id: req.user.profileId},
        cookies: req.cookies,

    });
});

// when login failed, send failed msg
router.get("/login/failed", (req, res) => {
    res.status(401).json({
        authenticated: false,
        message: "user failed to authenticate."
    });
});

module.exports = router;