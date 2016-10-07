var fs = require('fs');
var http = require('http');
var path = require('path');
var archive = require('../helpers/archive-helpers');
var httpHelper = require('./http-helpers');
// require more modules/folders here!

var writeFile = function(req, res) {
    // var file = fs.createWriteStream('www.google.com.html');
  var filename = req.url.substring(1);
//  var pathname = path.join(__dirname, `./archives/sites/${filename}`);
  var pathname = path.join(archive.paths.archivedSites, `/${filename}`);
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
    httpHelper.serveAssets(res, {path: path.join(archive.paths.siteAssets, '/index.html'), contentType: 'text/html', statusCode: 200});
  } else if (req.url === '/styles.css' && req.method === 'GET') {
    httpHelper.serveAssets(res, {path: path.join(archive.paths.siteAssets, '/styles.css'), contentType: 'text/css', statusCode: 200});
  } else if (req.method === 'POST') {
    
    var body = '';
    var urlToSaved;
    req.on('data', function(chunk) {      
      body += chunk.toString();
    });
    req.on('end', function() {      
      urlToSaved = body.split('=')[1];
      console.log(urlToSaved);

      archive.isUrlArchived(urlToSaved, function(exist) {
        if (exist) {
          httpHelper.serveAssets(res, {path: path.join(archive.paths.archivedSites, `/${urlToSaved}`), contentType: 'text/html', statusCode: 200});
        } else {      
          archive.isUrlInList(urlToSaved, function(urlStored) {
            if (!urlStored) {
              archive.addUrlToList(urlToSaved, function() {
                httpHelper.serveAssets(res, {path: path.join(archive.paths.siteAssets, '/loading.html'), contentType: 'text/html', statusCode: 302});
              });
            } else {
              httpHelper.serveAssets(res, {path: path.join(archive.paths.siteAssets, '/loading.html'), contentType: 'text/html', statusCode: 302});
            }

          });
        }
      }); 
    });

  } else {
    writeFile(req, res);
  }
};

