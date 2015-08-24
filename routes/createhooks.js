var express = require('express');
var router = express.Router();
var Client = require('github');
var config = require('config');
var Log = require('log')
   ,log = new Log('info');
var OAuth2 = require('oauth').OAuth2;
var github = new Client({
  version: "3.0.0"
})

router.get('/', function (req, res, next) {
  var repo = Object.keys(req.query)[0];
  var user = req.session.user;
  if (!repo) {
    res.redirect(303, '/?success=1&msg=please choose a repo');
    res.end();
    return;
  }

  github.authenticate({
    type: "oauth",
    token: req.session.accessToken
  });
    
  // createhooks
  github.repos.createHook({
    // TODO:need to set secret to avid unknown webhook 
    "user": user.login,
    "repo": repo,
    "name": "web",
    "config": {
      "url": config.get('GitHub.hookUrl'),
      "content_type": config.get('GitHub.contentType')
    }
  }, function (err, data) {
    if (err) {
      log.error(err);
      res.redirect(303, '/?success=1&msg=fail to create repo');
      res.end();
      return;
    };
    res.redirect(303, '/?success=0&msg=Create repo webhooks success please wait a few minutes for building docs');
    res.end();
  });
});

module.exports = router;