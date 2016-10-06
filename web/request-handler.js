var path = require('path');
var archive = require('../helpers/archive-helpers');
var fs = require('fs');
var http = require('http');
// require more modules/folders here!
var httpHelper = require('./http-helpers');

var writeFile = function(req, res) {
    // var file = fs.createWriteStream('www.google.com.html');
  var filename = `${req.url.substring(1)}.html`;
  var pathname = path.join(__dirname, `./archives/sites/${filename}`);
  var file = fs.createWriteStream(pathname);
  var request = http.get(`http:/${req.url}`, function(response) {
    response.pipe(file);
    response.on('end', function() {
      file.end();
      httpHelper.serveAssets(res, {path: pathname, contentType: 'text/html'});
    });
  });
};


exports.handleRequest = function (req, res) {
  console.log('serving', req.url, 'method:', req.method);
  if (req.url === '/') {
    httpHelper.serveAssets(res, {path: path.join(__dirname, '/public/index.html'), contentType: 'text/html'});
  } else if (req.url === '/styles.css') {
    httpHelper.serveAssets(res, {path: path.join(__dirname, '/public/styles.css'), contentType: 'text/css'});
  } else {
    writeFile(req, res);
  }
};

