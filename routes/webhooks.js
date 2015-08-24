var express = require('express');
var router = express.Router();
var command = require('../lib/command');
var fs = require('fs');

router.post('/', function (req, res, next) {
  var client = req.app.get('client');
  var repo = req.body.repository;
  repo["user_name"] = repo["full_name"].split('/')[0];
  fs.exists('projs/' + repo["full_name"], function (exists) {
    if (exists) {
      res.send(repo["full_name"] + ' already exists, git pull to update');
      command.pull(repo, client, 'docs/'+repo["full_name"] + '/search-data.json');
    } else {
      res.send('not exists, git clone to create');
      command.clone(repo, client, 'docs/'+repo["full_name"] + '/search-data.json');
    }
    res.end('done.');
  })
});

module.exports = router;