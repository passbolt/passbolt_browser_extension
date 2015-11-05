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
        keyring = new Keyring();


    // Build request data.
    var requestData = {
        'AuthenticationToken': {
            'token': data.token
        },
        'User': {
            'password': data.password
        },
        'Gpgkey': {
            'key' : data.publicKey
        }
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
        deferred.reject(e.message);
    }

    // Save the new password and other information.
    Request({
        url: url,
        content: requestData,
        onComplete: function (raw) {
            var response = JSON.parse(raw.text);
            if (typeof response.header == 'undefined' || typeof response.header.status == 'undefined' || response.header.status != 'success') {
                deferred.reject(response);
            }
            else {
                // Set user ID.
                try {
                    user.setId(response.body.User.id);
                }
                catch(e) {
                    deferred.reject('error importing the key : ' + e.message);
                    return deferred.promise;
                };

                // Store the user public key in the keyring.
                // We store the one generated locally, not the one returned by the server.
                var keyring = new Keyring();
                try {
                    keyring.importPublic(data.publicKey, response.body.User.id);
                } catch(e) {
                    deferred.reject('error importing the key : ' + e.message);
                    return deferred.promise;
                };

                // Everything alright, we resolve.
                deferred.resolve(response.body.length);
            }
        }
    }).put();

    return deferred.promise;
};
exports.save = save;
