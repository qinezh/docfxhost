var express = require('express');
var router = express.Router();
var config = require('config');
var Client = require('github');
var OAuth2 = require('oauth').OAuth2;
var github = new Client({
  version: "3.0.0"
})

var clientId = config.get('GitHub.appId');
var secret = config.get('GitHub.secret');
var url = config.get('GitHub.url');
var loginUrl = config.get('GitHub.loginUrl');
var tokenUrl = config.get('GitHub.tokenUrl');
var callbackUrl = config.get('GitHub.callbackUrl');
var authScope = config.get('GitHub.scope');
var oauth = new OAuth2(clientId, secret, url, loginUrl, tokenUrl);

router.get('/', function (req, res, next) {
  if (!req.session.accessToken) {
    res.redirect(303, oauth.getAuthorizeUrl({
      redirect_uri: callbackUrl,
      scope: authScope
    }));
    return;
  } 
  res.redirect(303, '/signin/success');
});

router.get('/github-callback', function (req, res, next) {
  oauth.getOAuthAccessToken(req.query.code, {}, function (err, access_token, refresh_token) {
    if (err) next(err);
    req.session.accessToken = access_token;
            
    // authenticate github API
    github.authenticate({
      type: "oauth",
      token: req.session.accessToken
    });

    var repos = [];
    github.user.get({}, function (err, user) {
      if (err) next(err);
      github.repos.getAll({}, function (err, data) {
        if (err) next(err);
        data.forEach(function (repo) {
          repos.push(repo.name);
        });
        req.session.user = user;
        req.session.repos = repos;
        res.redirect(303, '/signin/success');
      });
    });
  });
});

router.get('/success', function(req, res, next) {
  res.render('oauthSuccess.jade');
});

module.exports = router;
