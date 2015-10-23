const { defer } = require('sdk/core/promise');
var Validator = require('../vendors/validator');
var Config = require("./config");
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

	// URLs
	this.URL_USERS_ME = '/users/me.json';
};

User.prototype.__validate = function(field, value) {
	switch (field) {
		case 'firstname':
			if(typeof value === 'undefined') {
				throw new Error(__('The first name cannot be empty'));
			}
			if(!Validator.isAlphanumericSpecial(value)) {
				throw new Error(__('The first name name should only contain alphabetical and numeric characters'))
			}
		break;
		case 'lastname' :
			if(typeof value === 'undefined') {
				throw new Error(__('The last name cannot be empty'));
			}
			if(!Validator.isAlphanumericSpecial(value)) {
				throw new Error(__('The last name name should only contain alphabetical and numeric characters'))
			}
		break;
		case 'username' :
			if(typeof value === 'undefined') {
				throw new Error(__('The username cannot be empty'));
			}
			if(!Validator.isEmail(value)) {
				throw new Error(__('The username should be a valid email address'))
			}
		break;
		default :
			throw new Error(__('No validation defined for field: ' + field));
		break;
	}
	return true;
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
		url = self.settings.getDomain() + this.URL_USERS_ME;
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
					} else {
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
 * Set a firstname and last name for the plugin user
 * @param firstname string
 * @param lastname string
 * @throw Error when name is not a alphanumeric or is empty
 */
User.prototype.setName = function(firstname, lastname) {
	this.__validate('firstname',firstname);
	this.__validate('lastname', lastname);
	return (Config.write('firstname', firstname) && Config.write('lastname', lastname));
};

/**
 * Set a username for the plugin user
 * @param username string
 * @throw Error when username is not a valid email or is empty
 */
User.prototype.setUsername = function(username) {
	this.__validate('username', username);
	return (Config.write('username', username));
};

/**
 * Tell if the current user and its settings are good to use
 * @returns {*}
 */
User.prototype.isValid = function () {
	// @TODO check user information also
	return this.settings.isValid();
};

// Exports the Gpg Key object.
exports.User = User;