var openpgp = require('../vendors/openpgp');
var storage = new (require('../vendors/node-localstorage').LocalStorage)();
var Request = require('sdk/request').Request;
const { defer } = require('sdk/core/promise');
var Config = require('./config');
var Keyring = require('./keyring').Keyring;
var User = require('./user').User;

/**
 * Initialize the setup process.
 */
var reset = function() {
    // Delete user settings
    var user = new User();
    user.settings.flush();

    // Flush the keyring.
    var keyring = new Keyring();
    keyring.flush();
};
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
        keyring = new Keyring(),
        keyInfo = keyring.keyInfo(data.publicKey);

    // Build key data.
    var key = {
        'key' : data.publicKey,
        'fingerprint': keyInfo.fingerprint,
        'key_id': keyInfo.keyId,
        'bits': keyInfo.length,
        'type': keyInfo.algorithm,
        'uid': keyInfo.userIds[0].name + (keyInfo.userIds[0].comment != undefined ? ' (' + keyInfo.userIds[0].comment + ')' : '' ) + ' <' + keyInfo.userIds[0].email + '>',
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

    // Save the user settings, e.g. security token & domain
    var user = new User();
    try {
        user.settings.setSecurityToken({
            code: data.securityTokenCode,
            color: data.securityTokenColor,
            textcolor: data.securityTokenTextColor
        });
        // Save baseUrl.
        user.settings.setDomain(data.domain);
    } catch (e) {
        console.log(e.message);
        deferred.reject(e.message);
    }

    // Save the new password and other information.
    Request({
        url: url,
        content: requestData,
        onComplete: function (raw) {
            var response = JSON.parse(raw.text);
            if (typeof response.header.status != 'undefined' && response.header.status == 'success') {
                // Store all the new keys in the keyring.
                var keyring = new Keyring();
                // @TODO use the public key stored locally not the one returned by the server
                // only store the user id
                keyring.importPublic(response.body.Gpgkey.key, response.body.User.id);
                deferred.resolve(response.body.length);
            } else {
                deferred.reject(response);
            }
        }
    }).put();

    return deferred.promise;
};
exports.save = save;
