var Promise = require("bluebird");
var using = Promise.using;
var mongodb = Promise.promisifyAll(require("mongodb"));
var MongoClient = mongodb.MongoClient;
var config = require("./config");
var url = "mongodb://" + config.host + ":" + config.port + "/" + config.db;

function getConnection() {
  return MongoClient.connectAsync(url)
    .disposer(function(connection, promise) {
      connection.close();
    });
}

function countByDate(date) {
  return using(getConnection(), function(db) {
    return db.collection("apk_paths")
      .count({
        d: date
      });
  });
}

function countByExtracted() {
  return using(getConnection(), function(db) {
    return db.collection("apk_paths")
      .count({
        extracted: true
      });
  });
}

function countAll() {
  return using(getConnection(), function(db) {
    return db.collection("apk_paths")
      .count();
  });
}

module.exports = {
  countByDate: countByDate,
  countByExtracted: countByExtracted,
  countAll: countAll
};
