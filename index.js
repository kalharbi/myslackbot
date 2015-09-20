var Promise = require("bluebird");
var moment = require("moment");
var db = require("./db");
var config = require("./config");
var request = Promise.promisifyAll(require("request"));

var yesterday = moment()
  .subtract(1, "day")
  .format("YYYY-M-D");

db.countByDate(yesterday)
  .then(function(newDownloads) {
    var downloadedMessage = newDownloads +
      " new APK files were downloaded yesterday.";
    downloadedMessage +=
      " Please join me in welcoming these apps to our awesome dataset.";
    var emoji = ":smiley:";
    if (newDownloads == 0) {
      downloadedMessage = "No new APK files were downloaded yesterday.";
      emoji = ":disappointed:";
    }
    if (newDownloads == 1) {
      downloadedMessage = "Only one new APK file was downloaded yesterday.";
      emoji = ":confused:";
    }
    return downloadedMessage + " " + emoji;
  })
  .then(function(message) {
    return db.countByExtracted()
      .then(function(result) {
        return message +
          "\nTotal APK files that have been decomiled and extracted: " +
          result;
      });
  })
  .then(function(message) {
    return db.countAll()
      .then(function(result) {
        return message +
          "\nTotal APK files in our awesome dataset: " +
          result;
      });
  })
  .then(function(message) {
    var date = moment()
      .format("dddd, MMM Do YYYY h:mA");
    var statusMessage = "Good morning everyone,\nBelow is a summery of Sieveable's dataset as of today " +
     date + "\n\n" + message + "\n\n" +
      "Enjoy your day and see you tomorrow with another update.";
    var qs = {
      token: config.slackToken,
      channel: config.slackChannel,
      text: statusMessage,
      username: config.slackUser
    };
    return request.postAsync({
      url: "https://slack.com/api/chat.postMessage",
      qs: qs
    });
  });
