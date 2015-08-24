var fs = require('fs');
var events = require('events');
var config = require('config');

var Collector = function(client) {
	this.client = client;
}

Collector.prototype = new events.EventEmitter();
Collector.prototype.initIndex = function(callback) {
	    this.client.indices.create({
        index: "staticsite",
        body: {
            "settings": {
                "analysis": {
                    "filter": {
                        "autocomplete_filter": {
                            "type": "edge_ngram",
                            "min_gram": 1,
                            "max_gram": 10
                        }
                    },
                    "analyzer": {
                        "autocomplete": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": [
                                "lowercase",
                                "autocomplete_filter"
                            ]
                        }
                    }
                }
            },
            "mappings": {
                "docs": {
                    "properties": {
                        "path": {
                            "type": "string",
                            "fields": {
                                "raw": {"type": "string", "index": "not_analyzed"}
                            }
                        },
                        "title": {
                            "type": "string",
                            "fields": {
                                "raw": {"type": "string", "index": "not_analyzed"}
                            }
                        },
                        "keywords": {
                            "type": "string",
                            "fields": {
                                "autocomplete": {"type": "string", "index_analyzer": "autocomplete"}
                            }
                        },
                        "display": {
                            "type": "string",
                            "fields": {
                                "raw": {"type": "string", "index": "not_analyzed"}
                            }
                        },
						"belongs": {
                            "type": "string",
                            "fields": {
                                "raw": {"type": "string", "index": "not_analyzed"}
                            }
                        }
                    }
                }
            }
        }

    }, callback);
}

Collector.prototype.delIndex = function(callback) {
  var client = this.client;
  client.indices.exists({index: "staticsite"}, function(err, exists) {
    if (exists === true) {
	    client.indices.delete({index: "staticsite"}, callback);
    }
  });
}

Collector.prototype.pushData = function (dataPath, callback) {
  var userName = dataPath.split('/')[1];
  var staticAppName = dataPath.split('/')[2];
  var client = this.client;
  fs.readFile(dataPath, 'utf8', function (err, data) {
    if (err) throw err;
    var dataSet = JSON.parse(data);
    var body = [];
    for (var key in dataSet) {
      body.push({ "index": { "_index": config.get('ElasticSearch.index'), "_type": config.get('ElasticSearch.type') } });
      var item = dataSet[key];
      item["belongs"] = userName+'/'+staticAppName;
      body.push(item);
    }
    client.bulk({ body: body }, callback);
  });
}

module.exports = Collector;