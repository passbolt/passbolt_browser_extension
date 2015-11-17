var __ = require("sdk/l10n").get;
var Config = require('./config');
var Validator = require('../vendors/validator');

/**
 * The class that deals with users settings
 */
var Settings = function() {};

/**
 * Sanity check on user settings
 * @return
 */
Settings.prototype.isValid = function() {
    try {
        this.getSecurityToken();
        this.getDomain();
    } catch(e) {
        return false;
    }
    return true;
};

/**
 * Validate a security token
 * @param token
 * @returns {boolean} true if successfull
 * @throw Error on validation failure
 * @private
 */
Settings.prototype.__validateToken = function (token) {
    if( (typeof token === 'undefined')) {
        throw Error(__('A token cannot be empty'));
    }

    if (typeof token.code === 'undefined' || token.code === '') {
        throw Error(__('A token code cannot be empty'));
    }

    //if(!Validator.isAlphanumericSpecial(token.code)) {
    //    throw new Error(__('The token code should only contain alphabetical and numeric characters'))
    //}

    if(!Validator.isLength(token.code, 3, 3)) {
        throw Error(__('The token code should only contain 3 characters'))
    }

    if (typeof token.color === 'undefined' || token.color === '') {
        throw Error(__('The token color cannot be empty'));
    }

    if(!Validator.isHexColor(token.color)) {
        throw Error(__('This is not a valid token color: ' + token.color + '.'));
    }

    if (typeof token.textcolor === 'undefined' || token.textcolor === '') {
        throw Error(__('The token text color cannot be empty'));
    }

    if(!Validator.isHexColor(token.textcolor)) {
        throw Error(__('This is not a valid token text color: ' + token.textcolor + '.'));
    }
    return true;
};

/**
 * Validate a domain
 * @param token
 * @returns {boolean} true if successfull
 * @throw Error on validation failure
 * @private
 */
Settings.prototype.__validateDomain = function (domain) {
    if((typeof domain === 'undefined' || domain === '')) {
        throw new Error(__('A domain cannot be empty'));
    }
    if(!Validator.isURL(domain)) {
        throw new Error(__('The trusted domain url is not valid'));
    }
    return true;
};

/**
 * Return the user security token
 * @param token
 * @throw Error when security token is not set
 */
Settings.prototype.getSecurityToken = function() {
    var token = {};
    token.code = Config.read('user.settings.securityToken.code');
    token.color = Config.read('user.settings.securityToken.color');
    token.textcolor = Config.read('user.settings.securityToken.textColor');

    if( (typeof token.code === 'undefined') ||
        (typeof token.color === 'undefined') ||
        (typeof token.textcolor === 'undefined'))
    {
        throw new Error(__('Security token is not set'));
    }
    return token;
};

/**
 * Set the user security token
 * @param token
 * @throw Error when security token does not validate
 */
Settings.prototype.setSecurityToken = function(token) {
    this.__validateToken(token);
    Config.write('user.settings.securityToken.code', token.code);
    Config.write('user.settings.securityToken.color', token.color);
    Config.write('user.settings.securityToken.textColor', token.textcolor);
    return true;
};

/**
 * Set a domain (url, ip, etc) that the plugin can trust
 * @param domain
 * @throw Error when domain is not a valid url or is empty
 */
Settings.prototype.setDomain = function(domain) {
    this.__validateDomain(domain);
    return Config.write('user.settings.trustedDomain', domain);
};

/**
 * The url of the domain the passbolt plugin can trust
 * @returns {undefined|string}
 */
Settings.prototype.getDomain = function() {
    var domain = Config.read('user.settings.trustedDomain');

    if(typeof domain === 'undefined') {
        if ( !Config.isDebug()) {
            throw new Error(__('Trusted domain is not set'));
        } else {
            domain = Config.read('baseUrl');
            if(typeof domain === 'undefined') {
                throw new Error(__('Base url not found in config'));
            }
        }
    }
    return domain;
};

/**
 * Return all the settings
 * @returns {{}}
 */
Settings.prototype.get = function() {
    var settings = {};
    settings.domain = this.getDomain();
    settings.securityToken = this.getSecurityToken();
    return settings;
};

/**
 * Set all the settings at once
 * @param settings
 * @throw Error if settings is empty or doesn't validate
 * @returns {boolean}
 */
Settings.prototype.set = function (settings) {
    if(typeof settings === 'undefined') {
        throw new Error(__('Settings cannot be empty'));
    }
    this.setSecurityToken(settings.securityToken);
    this.setDomain(settings.domain);
    return true;
};

/**
 * Flush the user settings
 */
Settings.prototype.flush = function () {
    Config.flush();
};

exports.Settings = Settings;