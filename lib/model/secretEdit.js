/**
 * Secret edit model.
 * It represents all the data used while editing a secret.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

const { defer } = require('sdk/core/promise');
var Crypto = require('../model/crypto').Crypto;

var _secrets = {};
exports._secrets = _secrets;

var SecretEdit = function (data) {
  this.update(data);
};

SecretEdit.prototype.resourceId = null;
SecretEdit.prototype.armored = null;
SecretEdit.prototype.secret = null;

SecretEdit.get = function (tabId) {
  return _secrets[tabId] ? _secrets[tabId] : null;
};

SecretEdit.prototype.update = function (data) {
  for (var i in data) {
    this[i] = data[i];
  }
};

SecretEdit.prototype.save = function (tabId) {
  _secrets[tabId] = this;
};

SecretEdit.prototype.delete = function () {
  delete _secrets[tabId];
};

SecretEdit.prototype.isDecrypted = function () {
  return this.secret != null;
};


exports.SecretEdit = SecretEdit;
