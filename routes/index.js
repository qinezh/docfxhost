var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  var msg = req.query.msg;
  var docPaths = {};
  var userFolders = fs.readdirSync('docs');
  for (var i in userFolders) {
    var userFolder = path.join('docs', userFolders[i]).replace(/\\/g, '/');
    var docFolders = fs.readdirSync(userFolder);
    for (var j in docFolders) {
      var docPath = path.join(userFolders[i], docFolders[j]).replace(/\\/g, '/');
      docPaths[docFolders[j]] = docPath;
    }
  }
  res.render('index', { title: 'DocFx', docs: docPaths, msg: msg, user: req.session.user, repos: req.session.repos});
});

module.exports = router;
