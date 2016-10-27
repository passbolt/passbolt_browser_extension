/**
 * Gpg Auth Http Header Model
 *
 * @copyright (c) 2016-onwards Bolt Softwares pvt. ltd.
 * @licence AGPL-3.0 http://www.gnu.org/licenses/agpl-3.0.en.html
 */
"use strict";

var __ = require("sdk/l10n").get;

/**
 * The class that deals with secrets.
 */
var GpgAuthHeader = function (headers) {
  var compatibleHeaders = this.__toLowerCase(headers);
  this.headers = {};
  var allowedHeaders = [
    'x-gpgauth-version',
    'x-gpgauth-authenticated',
    'x-gpgauth-progress',
    'x-gpgauth-user-auth-token',
    'x-gpgauth-verify-response',
    'x-gpgauth-refer',
    'x-gpgauth-debug',
    'x-gpgauth-error'
  ];
  for (var i = 0; i < allowedHeaders.length; i++) {
    if (typeof compatibleHeaders[allowedHeaders[i]] !== 'undefined') {
      this.headers[allowedHeaders[i]] = compatibleHeaders[allowedHeaders[i]];
    }
  }
};

/**
 * Validate the headers for a given step.
 * @param step {string} The step name to validate
 * @returns {bool}
 * @throw Error
 *   if the common validation failed
 *   if the validation of the step failed
 */
GpgAuthHeader.prototype.validate = function (step) {
  // Checks common to all stages
  var commonChecks = this.__validateCommonAllStage();
  if (commonChecks instanceof Error) {
    throw commonChecks;
  }

  // Check if the headers are correct
  var result = this.__validateByStage(step);
  if (result instanceof Error) {
    throw new Error(result.message);
  }

  return true;
};

/**
 * Make sure the headers are in lower case if it's not already the case
 * See. PASSBOLT-1668
 *
 * @param headers {array} The headers information to lower case
 * @returns {array}
 * @private
 */
GpgAuthHeader.prototype.__toLowerCase = function (headers) {
  var legacyHeaders = [
    'X-GPGAuth-Version',
    'X-GPGAuth-Authenticated',
    'X-GPGAuth-Progress',
    'X-GPGAuth-User-Auth-Token',
    'X-GPGAuth-Verify-Response',
    'X-GPGAuth-Refer',
    'X-GPGAuth-Debug',
    'X-GPGAuth-Error'
  ];
  for (var i = 0; i < legacyHeaders.length; i++) {
    if (typeof headers[legacyHeaders[i]] !== 'undefined') {
      headers[legacyHeaders[i].toLowerCase()] = headers[legacyHeaders[i]];
      delete headers[legacyHeaders[i]];
    }
  }
  return headers;
};

/**
 * Common validation rules for all stages.
 * @returns {*} True or Error
 * @private
 */
GpgAuthHeader.prototype.__validateCommonAllStage = function () {
  var error_msg;

  // Check if headers are present
  if (typeof this.headers === 'undefined') {
    return new Error(__('No GPGAuth headers set.'))
  }

  // Check if version is supported
  if (typeof this.headers['x-gpgauth-version'] !== 'string' ||
    this.headers['x-gpgauth-version'] != '1.3.0') {
    return new Error(__('That version of GPGAuth is not supported. (' + this.headers['x-gpgauth-version'] + ')'));
  }

  // Check if there is GPGAuth error flagged by the server
  if (this.headers['x-gpgauth-error'] != undefined) {
    error_msg = this.headers['x-gpgauth-debug'];
    return new Error(error_msg);
  }

  return true;
};

/**
 * Validate the GPGAuth custom HTTP headers of the server response for a given stage.
 * @param stage {string} The stage name to validate
 * @returns {*} True or Error
 */
GpgAuthHeader.prototype.__validateByStage = function (stage) {
  // Stage specific checks
  switch (stage) {
    case 'logout' :
      if (typeof this.headers['x-gpgauth-authenticated'] !== 'string' ||
        this.headers['x-gpgauth-authenticated'] != 'false') {
        return new Error(__('x-gpgauth-authenticated should be set to false during the logout stage'));
      }
      break;
    case 'verify' :
    case 'stage0' :
      if (typeof this.headers['x-gpgauth-authenticated'] !== 'string' ||
        this.headers['x-gpgauth-authenticated'] != 'false') {
        return new Error(__('x-gpgauth-authenticated should be set to false during the verify stage'));
      }
      if (typeof this.headers['x-gpgauth-progress'] !== 'string' ||
        this.headers['x-gpgauth-progress'] != 'stage0') {
        return new Error(__('x-gpgauth-progress should be set to stage0 during the verify stage'));
      }
      if (typeof this.headers['x-gpgauth-user-auth-token'] !== 'undefined') {
        return new Error(__('x-gpgauth-user-auth-token should not be set during the verify stage' + typeof this.headers['x-gpgauth-user-auth-token']));
      }
      if (typeof this.headers['x-gpgauth-verify-response'] !== 'string') {
        return new Error(__('x-gpgauth-verify-response should be set during the verify stage'));
      }
      if (typeof this.headers['x-gpgauth-refer'] !== 'undefined') {
        return new Error(__('x-gpgauth-refer should not be set during verify stage'));
      }
      break;

    case 'stage1' :
      if (typeof this.headers['x-gpgauth-authenticated'] !== 'string' ||
        this.headers['x-gpgauth-authenticated'] != 'false') {
        return new Error(__('x-gpgauth-authenticated should be set to false during stage1'));
      }
      if (typeof this.headers['x-gpgauth-progress'] !== 'string' ||
        this.headers['x-gpgauth-progress'] != 'stage1') {
        return new Error(__('x-gpgauth-progress should be set to stage1'));
      }
      if (typeof this.headers['x-gpgauth-user-auth-token'] === 'undefined') {
        return new Error(__('x-gpgauth-user-auth-token should be set during stage1'));
      }
      if (typeof this.headers['x-gpgauth-verify-response'] !== 'undefined') {
        return new Error(__('x-gpgauth-verify-response should not be set during stage1'));
      }
      if (typeof this.headers['x-gpgauth-refer'] !== 'undefined') {
        return new Error(__('x-gpgauth-refer should not be set during stage1'));
      }
      return true;

    case 'complete':
      if (typeof this.headers['x-gpgauth-authenticated'] !== 'string' ||
        this.headers['x-gpgauth-authenticated'] != 'true') {
        return new Error(__('x-gpgauth-authenticated should be set to true when GPGAuth is complete'));
      }
      if (typeof this.headers['x-gpgauth-progress'] !== 'string' ||
        this.headers['x-gpgauth-progress'] != 'complete') {
        return new Error(__('x-gpgauth-progress should be set to complete during final stage'));
      }
      if (typeof this.headers['x-gpgauth-user-auth-token'] !== 'undefined') {
        return new Error(__('x-gpgauth-user-auth-token should not be set during final stage'));
      }
      if (typeof this.headers['x-gpgauth-verify-response'] !== 'undefined') {
        return new Error(__('x-gpgauth-verify-response should not be set during final stage'));
      }
      if (typeof this.headers['x-gpgauth-refer'] !== 'string') {
        return new Error(__('x-gpgauth-refer should be set during final stage'));
      }
      return true;

    default:
      return new Error(__('Unknown GPGAuth stage'));
  }
};

exports.GpgAuthHeader = GpgAuthHeader;
