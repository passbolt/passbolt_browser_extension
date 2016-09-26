/**
 * Gpg Auth Token Model
 *
 * @copyright (c) 2016-onwards Bolt Softwares pvt. ltd.
 * @licence AGPL-3.0 http://www.gnu.org/licenses/agpl-3.0.en.html
 */
"use strict";

var __ = require("sdk/l10n").get;
var Crypto = require('./crypto.js').Crypto;
var Validator = require('../vendors/validator');

/**
 * Constructor
 * @param token string
 */
var GpgAuthToken = function(token) {

  if(typeof token === 'undefined') {
    this.token = 'gpgauthv1.3.0|36|';
    this.token += Crypto.uuid();
    this.token += '|gpgauthv1.3.0';
  } else {
    var result = this.validate('token', token);
    if (result === true) {
      this.token = token;
    } else {
      throw result;
    }
  }
};

/**
 * Validate user fields individually
 * @param field string
 * @param value string
 * @return {*} true or Error
 */
GpgAuthToken.prototype.validate = function(field, value) {
  switch (field) {
    case 'token' :
      if(typeof value === 'undefined' || value === '') {
        return new Error(__('The user authentication token cannot be empty'));
      }
      var sections = value.split('|');
      if (sections.length !== 4) {
        return new Error(__('The user authentication token is not in the right format'));
      }
      if (sections[0] !== sections[3] && sections[0] !== 'gpgauthv1.3.0') {
        return new Error(__('Passbolt does not support this GPGAuth version'));
      }
      if (sections[1] !== '36') {
        return new Error(__('Passbolt does not support GPGAuth token nonce longer than 36 characters: ' + sections[2]));
      }
      if (!Validator.isUUID(sections[2])) {
        return new Error(__('Passbolt does not support GPGAuth token nonce that are not UUIDs'));
      }
      return true;
    default :
      return new Error(__('No validation defined for field: ' + field));
  }
};

exports.GpgAuthToken = GpgAuthToken;
