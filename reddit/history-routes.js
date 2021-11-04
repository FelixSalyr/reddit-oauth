const router = require('express').Router();
const ensureAuthenticated = require('../utils/ensureAuthenticated');
const makeRequest = require('../utils/axiosWrapper');

router.get('/saved', ensureAuthenticated, (req, res, next) => {
    makeRequest(`https://oauth.reddit.com/user/${req.user.name}/saved`, {
            method: 'GET',
            headers: {
                Authorization: `bearer ${req.user.access_token}`
            }
        })
        // filter the relevant data from the response
        .then(response => response.data.children.map((item, i) => ({
                post: !!(item.data.title),
                title: item.data.title ?? item.data.body,
                subreddit: item.data.subreddit,
                url: item.data.url,
                comments: item.data.permalink,
                thumbnail: item.data.thumbnail,
                domain: item.data.domain,
                post_hint: item.data.post_hint,
                thumbnail_width: item.data.thumbnail_width,
                thumbnail_height: item.data.thumbnail_height
            })))
        .then(items => res.status(200).json(items))
        .catch(error => res.status(error.message).send(error))
})


module.exports = router;