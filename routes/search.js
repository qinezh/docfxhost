var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  var client = req.app.get('client');
  client.search({
    index: 'staticsite',
    type: 'docs',
    body: {
      "query": {
        "filtered": {
          "query": {
            "multi_match": {
              "query": req.query.q,
              "fields": ["keywords.autocomplete"]
            }
          }
        }
      }
    }
  }).then(function (resp) {
    var results = resp.hits.hits.map(function (hit) {
      return {
        href: '/' + hit._source.belongs + '/#' + hit._source.path,
        belongs: hit._source.belongs,
        display: hit._source.display
      }
    });
    // TODO: Pagination for search results
    res.render('search.jade', { title: 'Search Results', results: results, user: req.session.user });
  }, function (err) {
    console.log(err.message);
    res.send({ response: err.message });
  });
});

module.exports = router;
