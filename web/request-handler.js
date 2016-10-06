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
  var request = http.get(`http:/${req.url}`, function(response) {
    var statusCode = response.statusCode; 
    if (statusCode === 200) {
      var file = fs.createWriteStream(pathname);
      response.pipe(file);
      response.on('end', function() {
        file.end();
        httpHelper.serveAssets(res, {path: pathname, contentType: 'text/html', statusCode: 200});
      });
    }
  });
  request.on('error', function(error) {
    res.writeHead(404, {contentType: 'text/plain'});
    res.end('Webpage Not Found!');
  });
};


exports.handleRequest = function (req, res) {
  console.log('serving', req.url, 'method:', req.method);
  if (req.url === '/' && req.method === 'GET') {
    httpHelper.serveAssets(res, {path: path.join(__dirname, '/public/index.html'), contentType: 'text/html', statusCode: 200});
  } else if (req.url === '/styles.css' && req.method === 'GET') {
    httpHelper.serveAssets(res, {path: path.join(__dirname, '/public/styles.css'), contentType: 'text/css', statusCode: 200});
  } else if (req.method === 'POST') {

    var body = '';
    var urlToSaved;
    req.on('data', function(chunk) {      
      body += chunk.toString();
    });
    req.on('end', function() {
      urlToSaved = body.split('=')[1];
      fs.appendFile(archive.paths.list, `${urlToSaved}\n`, function() {
        httpHelper.serveAssets(res, {path: archive.paths.list, contentType: 'text/html', statusCode: 302});
      });
    });

  } else {
    writeFile(req, res);
  }
};

