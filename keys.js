const REDDIT_TOKENS = {
    REDDIT_CONSUMER_KEY: "HpZvczyMWy9y_nRvsUpVBQ",
    REDDIT_CONSUMER_SECRET: "IYSuPWHgKnl9CgwQCNLCEWO29x_cwA"
}

const ENV = {
    ENV_HOSTNAME: 'nodeexpressoauth2reddit-env-1.eba-uf64jrde.us-east-1.elasticbeanstalk.com',
    ENV_DEV_HOSTNAME: 'localhost',
    ENV_PORT: 3000,
    DDB_USER_TABLE: 'reddit-users',
    SNS_USER_TOPIC: 'reddit-user-login-topic'
}

const REACT_APP = {
    REACT_APP_HOSTNAME: 'localhost',
    REACT_APP_DEV_HOSTNAME: 'localhost',
    REACT_APP_PORT: 3001
}

const SESSION = {
    COOKIE_KEY: "Dexter's Secret"
}

const KEYS = {
    ...REDDIT_TOKENS,
    ...ENV,
    ...REACT_APP,
    ...SESSION
}

module.exports = KEYS;

