function LocalStorage() {
  this._storage = window.localStorage;
  this._data = {};

  // Load the passbolt local storage.
  // Data are serialized in the local storage.
  var _data = this._storage.getItem('_passbolt_data');
  if (_data != null) {
    this._data = JSON.parse(_data);
  }
}

LocalStorage.prototype._store = function () {
  this._storage.setItem('_passbolt_data', JSON.stringify(this._data));
};

LocalStorage.prototype.getItem = function (keyStr) {
  return this._data[keyStr];
};

LocalStorage.prototype.setItem = function (keyStr, valueStr) {
  this._data[keyStr] = valueStr;
  this._store();
};

LocalStorage.prototype.removeItem = function (keyStr) {
  delete this._data[keyStr];
  this._store();
};

exports.LocalStorage = LocalStorage;

var storage = new LocalStorage();
exports.localStorage = storage;
