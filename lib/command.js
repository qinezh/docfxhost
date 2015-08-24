var execSync = require('child_process').execSync;
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var Log = require('log')
   ,log = new Log('info');
var Collector = require('./collector');

var fromDir = function(proj, ext) {
  var files = fs.readdirSync(proj);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(proj, files[i]);
    var stat = fs.lstatSync(filename);
    if (!stat.isDirectory() && path.extname(filename) === ext) {
      return filename;
    }
  }
  return "";
}

var add_index = function(client, data_file) {
  log.info("add " + data_file);
  var collector = new Collector(client);
  collector.pushData(data_file);
}

var modifyBaseHref = function(folder) {
  var repl = 'base href="' + folder.substring(4) + '/"';
  var indexPath = path.join(folder, 'index.html');
  fs.readFile(indexPath, 'utf8', function(err, html) {
    if (err) return log.error(err);
    var result = html.replace(/base href=".+?"/, repl);
    fs.writeFile(indexPath, result, 'utf8', function(err) {
      if (err) return console.log(err);
    })
  });
}

var docfxExec = function (sln, out, client, data_file) {
  exec('docfx ' + sln + ' --theme angular -o ' + out, function (err, stdout, stdin) {
    if (err) log.error(err);
    log.info(stdout);
    modifyBaseHref(out);
    add_index(client, data_file);
  });
}

exports.pull = function (repo, client, data_file) {
  //git pull
  var proj = 'projs/' + repo["full_name"];
  var out = 'docs/' + repo["full_name"];
  exec('cd projs/' + repo["full_name"] + ' && git pull', function (err, stdout, stdin) {
    if (err) log.error(err);
    log.info(stdout);
    // docfx
    var sln = fromDir(proj, '.sln');
    if (!sln) {
      log.info("sln file not found");
    } else {
      log.info('docfx %s --theme angular -o %s', sln, out);
      docfxExec(sln, out, client, data_file);
    }
  });
}

exports.clone = function (repo, client, data_file) {
  var user_folder = 'projs/' + repo["user_name"];
  var proj = 'projs/' + repo["full_name"];
  var out = 'docs/' + repo["full_name"];
  // mkdir
  log.info("mkdir folder");
  mkdirp(user_folder, function (err) {
    if (err) log.error(err);
    mkdirp(out, function (err) {
      if (err) log.error(err);
      // git clong
      log.info("git clone %s", repo["clone_url"])
      exec('cd ' + user_folder + ' && git clone ' + repo["clone_url"], function (err, stdout, stdin) {
        if (err) log.error(err);
        if (stdout) log.info(stdout);
        // docfx
        var sln = fromDir(proj, '.sln');
        if (!sln) {
          log.info("sln file not found");
        } else {
          log.info('docfx %s --theme angular -o %s', sln, out);
          docfxExec(sln, out, client, data_file);
        }
      });
    });
  });
}