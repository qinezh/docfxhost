var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('about', {user: req.session.user, repos: req.session.repos});
});

module.exports = router;