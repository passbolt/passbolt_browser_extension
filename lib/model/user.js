const { defer } = require('sdk/core/promise');
var Request = require("sdk/request").Request;
var Settings = require("./settings").Settings;
var __ = require("sdk/l10n").get;

/**
 * The class that deals with users.
 */
var User = function() {

	// see model/settings
	this.settings = new Settings();

	// reference to the user object returned by the server
	this._user = undefined;
};

User.prototype.check = function () {
	return 'this is a check check';
};

/**
 * Get current user from server
 * @returns {*}
 */
User.prototype.getCurrent = function() {
	var deferred = defer(),
		self = this,
		url;

	//Check if there is a trusted domain
	try {
		url = self.settings.getDomain() + "/users/me.json"
	} catch(e) {
		deferred.reject(__('The application domain is not set'));
	}

	// Ccheck if the settings are valid first
	if(this.settings.isValid() !== true) {
		deferred.reject(__('The user settings are not set'));
	}

	// Then get the current user from cache or server
	if(typeof this._user !== 'undefined') {
		deferred.resolve(this._user);
	} else {
		Request({
			url: url,
			onComplete: function (raw) {
				if(raw.status === '200') {
					var response = JSON.parse(raw.text);
					if (response.header.status == "success") {
						self._user = response.body;
						deferred.resolve(self._user);
					}
					else {
						deferred.reject(response);
					}
				} else {
					deferred.reject();
				}
			}
		}).get();
	}
	return deferred.promise;
};

/**
 * Tell if the current user and its settings are good to use
 * @returns {*}
 */
User.prototype.isValid = function () {
	return this.settings.isValid();
};

// Exports the Gpg Key object.
exports.User = User;