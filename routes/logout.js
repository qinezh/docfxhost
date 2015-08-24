var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  req.session.destroy(function(err) {
    console.log(err);
  });
  res.redirect(303, '/');
});

module.exports = router;