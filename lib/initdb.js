var fs = require('fs');
var path = require('path');
var Log = require('log')
   ,log = new Log('info');
var Collector = require('./collector');

module.exports = function (client) {
  var collector = new Collector(client);
  // delete index if exists
  collector.delIndex(function (err, response, status) {
    log.info('delete index Complete.');
    // create index
    collector.initIndex(function (err, response, status) {
      log.info('init index complete.');
      pushExistDocs('docs', collector);
    });
  });
}

// add search-data if /docs/* exists
var pushExistDocs = function (docsPath, collector) {
  fs.readdir(docsPath, function (err, users) {
    users.forEach(function (user) {
      var userPath = path.join('docs', user).replace(/\\/g, '/');
      fs.readdir(userPath, function (err, folders) {
        folders.forEach(function (folder) {
          var searchDataPath = path.join('docs', user, folder, 'search-data.json').replace(/\\/g, '/');
          fs.exists(searchDataPath, function (exists) {
            if (exists) {
              collector.pushData(searchDataPath);
            }
          });
        });
      });
    });
  });
}
      