var openpgp = require("openpgp");
var storage = new (require('node-localstorage').LocalStorage)();
var Request = require("sdk/request").Request;
const { defer } = require('sdk/core/promise');
var Config = require("model/config");
var Gpgkey = require("model/gpgkey").Gpgkey;
var GpgkeyController = require("controller/gpgkey");

/**
 * Initialize the setup process.
 */
var reset = function() {
  // Delete config.
  storage.deleteItem('config');
  // Flush the keyring.
  var gpgkey = new Gpgkey();
  gpgkey.flush(Gpgkey.PUBLIC);
  gpgkey.flush(Gpgkey.PRIVATE);
}
exports.reset = reset;

/**
 * Sync the local keyring with the passbolt back end.
 * Retrieve the latest updated Public Keys.
 */
var save = function(data) {
  var deferred = defer(),
    // Get the latest keys changes from the backend.
    url = data.domain + '/users/validateAccount/' + data.userId + '.json',
    // Get public key info.
    gpgkey = new Gpgkey(),
    keyInfo = gpgkey.keyInfo(data.publicKey);

    // Build key data.
  var key = {
    'key' : data.publicKey,
    'fingerprint': keyInfo.fingerprint,
    'key_id': keyInfo.keyId,
    'bits': keyInfo.length,
    'type': keyInfo.algorithm,
    'uid': keyInfo.userIds[0].name + (keyInfo.userIds[0].comment != undefined ? " (" + keyInfo.userIds[0].comment + ")" : "" ) + ' <' + keyInfo.userIds[0].email + '>',
    'key_created': keyInfo.created.toISOString(),
    'expires': keyInfo.expires
  };
  // Build request data.
  var requestData = {
    'AuthenticationToken': {
      'token': data.token
    },
    'User': {
      'password': data.password
    },
    'Gpgkey': key
  };

  // Store Color of security token.
  Config.write('securityTokenColor', data.securityTokenColor);
  Config.write('securityTokenTextColor', data.securityTokenTextColor);
  Config.write('securityTokenCode', data.securityTokenCode);
  // Save baseUrl.
  Config.write('baseUrl', data.domain);

  // Save the new password and other information.
  Request({
    url: url,
    content: requestData,
    onComplete: function (raw) {
      var response = JSON.parse(raw.text);
      if (response.header.status != undefined && response.header.status == "success") {
        // Store all the new keys in the keyring.
        var gpgkey = new Gpgkey();
        gpgkey.importPublic(response.body.Gpgkey.key, response.body.Gpgkey);
        // Resolve the defer with the number of updated keys.
        deferred.resolve(response.body.length);
      }
      else {
        deferred.reject(response);
      }
    }
  }).put();

  return deferred.promise;
};
exports.save = save;
