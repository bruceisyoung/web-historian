// Use the code in `archive-helpers.js` to actually download the urls
// that are waiting.
var handler = require('../web/request-handler.js');
var helpers = require('../helpers/archive-helpers.js');

module.exports.fetchHTML = function() {
  helpers.readListOfUrls(function(urls) {
    urls.forEach(function(url) {
      helpers.isUrlArchived(url, function(isArchived) {
        if (!isArchived) {
          helpers.downloadUrls([url]);
        }
      });
    });
  });
};

// */1 * * * * /Users/student/Documents/2016-09-web-historian/workers/htmlfetcher.js