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
	this._remote_user = {};

	// the fields
	this._user = {};

	// URLs
	this.URL_GET_REMOTE = '/users/me.json';
};

/**
 * Validate user fields individually
 * @param field
 * @param value
 * @returns {boolean}
 * @private
 */
User.prototype.__validate = function(field, value) {
	switch (field) {
		case 'firstname':
			if(typeof value === 'undefined' || value === '') {
				throw new Error(__('The first name cannot be empty'));
			}
			if(!Validator.isAlphanumericSpecial(value)) {
				throw new Error(__('The first name should only contain alphabetical and numeric characters'))
			}
		break;
		case 'lastname' :
			if(typeof value === 'undefined' || value === '') {
				throw new Error(__('The last name cannot be empty'));
			}
			if(!Validator.isAlphanumericSpecial(value)) {
				throw new Error(__('The last name should only contain alphabetical and numeric characters'))
			}
		break;
		case 'username' :
			if(typeof value === 'undefined' || value === '') {
				throw new Error(__('The username cannot be empty'));
			}
			if(!Validator.isEmail(value)) {
				throw new Error(__('The username should be a valid email address'))
			}
		break;
		case 'id' :
			if(typeof value === 'undefined' || value === '') {
				throw new Error(__('The user id cannot be empty'));
			}
			if(!Validator.isUUID(value)) {
				throw new Error(__('The user id should be a valid UUID'))
			}
		break;
		default :
			throw new Error(__('No validation defined for field: ' + field));
		break;
	}
	return true;
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
	this._user.lastname = lastname;
	this._user.firstname = firstname;
	return (Config.write('user.firstname', firstname) && Config.write('user.lastname', lastname));
};

/**
 * Set a username for the plugin user
 * @param username string
 * @throw Error when username is not a valid email or is empty
 */
User.prototype.setUsername = function(username) {
	this.__validate('username', username);
	this._user.username = username;
	return (Config.write('user.username', username));
};

/**
 * Set the user UUID
 * @param id UUID
 * @throw Error when the id is not a valid UUID or is empty
 */
User.prototype.setId = function(id) {
	this.__validate('id', id);
	this._user.id = id;
	return (Config.write('user.id', id));
};

/**
 * Set the user
 * @param user
 * @return boolean true if successful
 */
User.prototype.set = function (user) {
	if(typeof user === 'undefined') {
		throw new Error(__('The user cannot be empty'));
	}
	this.setId(user.id);
	this.setUsername(user.username);
	this.setName(user.firstname, user.lastname);

	if(typeof user.settings !== 'undefined') {
		this.settings.set(user.settings);
	}
	return true;
};

/**
 * Get the user and validate values before returning them
 *
 * @param data
 *   the data requested to be validated and returned.
 *   Example format :
 *   {
 *     user : ['firstname', 'lastname', 'username'],
 *     settings : ['domain', 'securityToken']
 *   }
 *
 *   Not providing this parameter will result in the function
 *   returning all the data known.
 */
User.prototype.get = function (data) {
	try {
		if(Object.keys(this._user).length === 0) {
            if (data != undefined && data.user != undefined) {
                this._getLocal(data.user);
            }
            else {
                this._getLocal();
            }
		}
		var user = this._user;

        // Get settings according to data provided.
        if (data != undefined && data.user != undefined && data.settings != undefined) {
            user.settings = this.settings.get(data.settings);
        }
        // If no data is provided, get everything.
        else if(data == undefined) {
            user.settings = this.settings.get();
        }

		return user;

	} catch(e) {
		throw new Error(__('The user is not set'));
	}
};

/**
 * Get the user name
 *
 * @return object
 *   json object with firstname and lastname
 */
User.prototype.getName = function () {
    var name = {
        firstname : Config.read('user.firstname'),
        lastname : Config.read('user.lastname')
    };
    return name;
};

/**
 * Get the username
 *
 * @return string
 *   username
 */
User.prototype.getUsername = function () {
    return  Config.read('user.username');
};

/**
 *  Get the current user from the local storage
 *
 *  All data returned are validated once again.
 *
 *  @param Array data
 *    user data to be returned.
 *
 *  @throw Exception in case a data doesn't validate before being returned
 */
User.prototype._getLocal = function(data) {

    // Default data to return for user.
    var userDefaultData = [
        "id",
        "username",
        "firstname",
        "lastname"
    ];

    // If data is not provided as a parameter, we use default data.
    if (data == undefined) {
        data = userDefaultData;
    }

    // For each user data requested, try to retrieve it and validate it.
    for (var i in data) {
        var varName = data[i];
        this._user[varName] = Config.read('user.' + varName);

        try {
            this.__validate(varName, this._user[varName]);
        } catch(e) {
            this._user[varName] = {};
            throw new Error(__('The user is not set'));
        }
    }

    return this._user;
};

/**
 * Get current user from server
 * You must be logged in to run this
 * @returns {*}
 */
User.prototype._getRemote = function() {
	var deferred = defer(),
		self = this,
		url;

	//Check if there is a trusted domain
	try {
		// @TODO check that the user is logged in at that point
		url = self.settings.getDomain() + this.URL_GET_REMOTE;
	} catch(e) {
		deferred.reject(__('The application domain is not set'));
	}

	// Then get the current user from cache or server
	if(typeof this._remote_user !== 'undefined') {
		deferred.resolve(this._remote_user);
	} else {
		Request({
			url: url,
			onComplete: function (raw) {
				if(raw.status === '200') {
					var response = JSON.parse(raw.text);
					if (response.header.status == 'success') {
						self._remote_user = response.body;
						deferred.resolve(self._remote_user);
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
 * Tell if the current user and its settings are good to use
 * @returns {*}
 */
User.prototype.isValid = function () {
	// @TODO check if local and remote matches
	try {
		this.get();
	} catch(e) {
		return false;
	}
	return this.settings.isValid();
};

// Exports the User object.
exports.User = User;