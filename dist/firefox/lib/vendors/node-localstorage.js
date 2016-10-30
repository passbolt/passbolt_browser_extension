
var ss = require('sdk/simple-storage');

function LocalStorage() {
  this.storage = ss.storage;
}

LocalStorage.prototype.getItem = function(keyStr) {
  return this.storage[keyStr] || null;
};

LocalStorage.prototype.setItem = function(keyStr, valueStr) {
  this.storage[keyStr] = valueStr;
};

LocalStorage.prototype.deleteItem = function(keyStr) {
  delete this.storage[keyStr];
};

exports.LocalStorage = LocalStorage;

var localStorage = new LocalStorage();
exports.localStorage = localStorage;