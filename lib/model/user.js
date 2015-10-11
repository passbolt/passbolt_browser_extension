var storage = new (require('../vendors/node-localstorage').LocalStorage)();
var Request = require("sdk/request").Request;
const { defer } = require('sdk/core/promise');
var Config = require("./config");

/**
 * The class that deals with users.
 */
var User = function() {};

/**
 * Get current user from server.
 */
User.prototype.getCurrent = function() {
	var deferred = defer(),
		url = Config.read('baseUrl') + "/users/me.json";

	// Get the current user from passbolt.
	// @TODO cache the results
	Request({
		url: url,
		onComplete: function (raw) {
			if(raw.status === '200') {
				var response = JSON.parse(raw.text);
				if (response.header.status == "success") {
					//storage.setItem('me', JSON.stringify(response.header.body));
					// Resolve the defer with the user.
					deferred.resolve(response.body);
				}
				else {
					deferred.reject(response);
				}
			} else {
				deferred.reject();
			}
		}
	}).get();
	return deferred.promise;
};

User.prototype.setSecurityToken = function(code, color, textcolor) {
	// @TODO validation
	Config.write('securityTokenCode', code);
	Config.write('securityTokenColor', color);
	Config.write('securityTokenTextColor', textcolor);
};

// Exports the Gpg Key object.
exports.User = User;