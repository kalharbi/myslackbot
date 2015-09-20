var Promise = require("bluebird");
var moment = require("moment");
var numeral = require("numeral");
var _ = require("lodash");
var db = require("./db");
var config = require("./config");
var request = Promise.promisifyAll(require("request"));

var yesterday = moment()
  .subtract(1, "day")
  .format("YYYY-M-D");

db.countByDate(yesterday)
  .then(function(newDownloads) {
    var downloadedMessage = "";
    var emoji = ":smiley:";
    if (!_.isNumber(newDownloads) || newDownloads == 0) {
      downloadedMessage = "No new APK files were downloaded yesterday.";
      emoji = ":disappointed:";
    } else if (newDownloads == 1) {
      downloadedMessage = "Only one new APK file was downloaded yesterday.";
      emoji = ":confused:";
    } else {
      downloadedMessage = numeral(newDownloads)
        .format("0,0") +
        " new APK files were downloaded yesterday.";
      downloadedMessage +=
        " Please join me in welcoming these apps to our awesome dataset.";
    }

    return downloadedMessage + " " + emoji;
  })
  .then(function(message) {
    return db.countByExtracted()
      .then(function(result) {
        return message +
          "\nTotal APK files that have been decompiled and extracted: " +
          numeral(result)
          .format("0,0") + " apps.";
      });
  })
  .then(function(message) {
    return db.countAll()
      .then(function(result) {
        return message +
          "\nTotal APK files in our awesome dataset: " +
          numeral(result)
          .format("0,0") + " apps.";
      });
  })
  .then(function(message) {
    var date = moment()
      .format("dddd, MMM Do YYYY h:mA");
    var statusMessage =
      "Good morning everyone,\nBelow is a summary of Sieveable's dataset as of today " +
      date + "\n\n" + message + "\n\n" +
      "Enjoy your " + moment()
      .format("dddd") + " and see you tomorrow with another update.";
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
