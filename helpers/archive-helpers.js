var fs = require('fs');
var http = require('http');
var path = require('path');
var _ = require('underscore');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!
var urls;

exports.readListOfUrls = function(callback) {
  fs.readFile(exports.paths.list, function(error, content) {
    urls = content.toString().split('\n');
    return callback(urls);
  });
};

exports.isUrlInList = function(testURL, callback) {
  exports.readListOfUrls(function(urls) {
    if (callback) {
      return callback(urls.indexOf(testURL) !== -1);
    }
  });
};

exports.addUrlToList = function(addURL, callback) {
  exports.isUrlInList(addURL, function(exists) {
    if (!exists) {
      fs.appendFile(exports.paths.list, `${addURL}\n`, function() {
        //TODO: FIGURE OUT `${addURL}\n`
        exports.isUrlInList(addURL, function(exists) {
        });
        if (callback) {
          return callback();
        }
      });
    }
  });

};

exports.isUrlArchived = function(testURL, callback) {
  fs.access(`${exports.paths.archivedSites}/${testURL}`, fs.F_OK, function(err) {
    if (callback) {
      callback(err == null);
    }
  });
};

exports.downloadUrls = function(urlArray, callback) {
  urlArray.forEach(function(url) {
    var pathname = path.join(exports.paths.archivedSites, `/${url}`);
    var request = http.get(`http://${url}`, function(response) {
      var statusCode = response.statusCode; 
      console.log('url', url, 'statusCode', statusCode);
      if (statusCode === 200) {
        var file = fs.createWriteStream(pathname);
        response.pipe(file);
        response.on('end', function() {
          file.end();
          exports.addUrlToList(url);
        });
      }
    });
    request.on('error', function(error) {
      console.log('download webpage failed', url);
    });
  });
};
