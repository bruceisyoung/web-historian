var fs = require('fs');
var htmlfetcher = require('../workers/htmlfetcher.js');
// Sync is ok here because this is called just once on startup.
module.exports = function (basePath) {
  // if the archive folder doesn't exist, create it.
  if (!fs.existsSync(basePath)) {
    // We use fs.mkdirSync to create the folder
    fs.mkdirSync(basePath);
  }

  // if the file doesn't exist, create it.
  if (!fs.existsSync(basePath + '/sites.txt')) {
    // We use fs.openSync to create the file
    var file = fs.openSync(basePath + '/sites.txt', 'w');
    fs.closeSync(file);
  }

  // if the folder doesn't exist, create it.
  if (!fs.existsSync(basePath + '/sites')) {
    // We use fs.mkdirSync to create the folder
    fs.mkdirSync(basePath + '/sites');
  }
};

var CronJob = require('cron').CronJob;
new CronJob('*/1 * * * *', function() {
  htmlfetcher.fetchHTML();
  console.log('Ran succesfully!');
}, null, true, 'America/Los_Angeles');