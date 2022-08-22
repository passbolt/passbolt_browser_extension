/**
 * Gpg Auth Http Header Model
 *
 * @copyright (c) 2016-onwards Bolt Softwares pvt. ltd.
 * @licence AGPL-3.0 http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import UserAlreadyLoggedInError from "../error/userAlreadyLoggedInError";


/**
 * The class that deals with secrets.
 */
const GpgAuthHeader = function(headers, step) {
  this.headers = {};
  const allowedHeaders = [
    'x-gpgauth-version',
    'x-gpgauth-authenticated',
    'x-gpgauth-progress',
    'x-gpgauth-user-auth-token',
    'x-gpgauth-verify-response',
    'x-gpgauth-refer',
    'x-gpgauth-debug',
    'x-gpgauth-error'
  ];
  let h;
  for (let i = 0; i < allowedHeaders.length; i++) {
    h = allowedHeaders[i];
    if (headers.has(h)) {
      this.headers[h] = headers.get(h);
    }
  }
  return this.__validate(step);
};

/**
 * Validate the headers for a given step.
 * @param step {string} The step name to validate
 * @returns {bool}
 * @throw Error
 *   if the common validation failed
 *   if the validation of the step failed
 */
GpgAuthHeader.prototype.__validate = function(step) {
  // Checks common to all stages
  const commonChecks = this.__validateCommonAllStage();
  if (commonChecks instanceof Error) {
    throw commonChecks;
  }

  // Check if the headers are correct
  const result = this.__validateByStage(step);
  if (result instanceof Error) {
    throw result;
  }

  return true;
};

/**
 * Common validation rules for all stages.
 *
 * @returns {*} True or Error
 * @private
 */
GpgAuthHeader.prototype.__validateCommonAllStage = function() {
  let error_msg;

  // Check if headers are present
  if (typeof this.headers === 'undefined') {
    return new Error('No GPGAuth headers set.');
  }

  // Check if version is supported
  if (typeof this.headers['x-gpgauth-version'] !== 'string' ||
    this.headers['x-gpgauth-version'] !== '1.3.0') {
    return new Error(`That version of GPGAuth is not supported. (${this.headers['x-gpgauth-version']})`);
  }

  // Check if there is GPGAuth error flagged by the server
  if (typeof this.headers['x-gpgauth-error'] !== 'undefined') {
    if (typeof this.headers['x-gpgauth-debug'] !== 'undefined') {
      error_msg = this.headers['x-gpgauth-debug'];
    } else {
      error_msg = 'There was an error during authentication. Enable debug mode for more information';
    }
    return new Error(error_msg);
  }

  return true;
};

/**
 * Validate the GPGAuth custom HTTP headers of the server response for a given stage.
 *
 * @param stage {string} The stage name to validate
 * @returns {*} True or Error
 */
GpgAuthHeader.prototype.__validateByStage = function(stage) {
  // Stage specific checks
  switch (stage) {
    case 'logout' :
      if (typeof this.headers['x-gpgauth-authenticated'] !== 'string' ||
        this.headers['x-gpgauth-authenticated'] != 'false') {
        return new Error('x-gpgauth-authenticated should be set to false during the logout stage');
      }
      break;
    case 'verify' :
    case 'stage0' :
      if (typeof this.headers['x-gpgauth-authenticated'] !== 'string' ||
        this.headers['x-gpgauth-authenticated'] != 'false') {
        return new Error('x-gpgauth-authenticated should be set to false during the verify stage');
      }
      if (typeof this.headers['x-gpgauth-progress'] !== 'string' ||
        this.headers['x-gpgauth-progress'] != 'stage0') {
        return new Error('x-gpgauth-progress should be set to stage0 during the verify stage');
      }
      if (typeof this.headers['x-gpgauth-user-auth-token'] !== 'undefined') {
        return new Error(`x-gpgauth-user-auth-token should not be set during the verify stage${typeof this.headers['x-gpgauth-user-auth-token']}`);
      }
      if (typeof this.headers['x-gpgauth-verify-response'] !== 'string') {
        return new Error('x-gpgauth-verify-response should be set during the verify stage');
      }
      if (typeof this.headers['x-gpgauth-refer'] !== 'undefined') {
        return new Error('x-gpgauth-refer should not be set during verify stage');
      }
      break;

    case 'stage1' :
      if (typeof this.headers['x-gpgauth-authenticated'] !== 'string' ||
        this.headers['x-gpgauth-authenticated'] != 'false') {
        return new UserAlreadyLoggedInError('x-gpgauth-authenticated should be set to false during stage1');
      }
      if (typeof this.headers['x-gpgauth-progress'] !== 'string' ||
        this.headers['x-gpgauth-progress'] != 'stage1') {
        return new Error('x-gpgauth-progress should be set to stage1');
      }
      if (typeof this.headers['x-gpgauth-user-auth-token'] === 'undefined') {
        return new Error('x-gpgauth-user-auth-token should be set during stage1');
      }
      if (typeof this.headers['x-gpgauth-verify-response'] !== 'undefined') {
        return new Error('x-gpgauth-verify-response should not be set during stage1');
      }
      if (typeof this.headers['x-gpgauth-refer'] !== 'undefined') {
        return new Error('x-gpgauth-refer should not be set during stage1');
      }
      return true;

    case 'complete':
      if (typeof this.headers['x-gpgauth-authenticated'] !== 'string' ||
        this.headers['x-gpgauth-authenticated'] != 'true') {
        return new Error('x-gpgauth-authenticated should be set to true when GPGAuth is complete');
      }
      if (typeof this.headers['x-gpgauth-progress'] !== 'string' ||
        this.headers['x-gpgauth-progress'] != 'complete') {
        return new Error('x-gpgauth-progress should be set to complete during final stage');
      }
      if (typeof this.headers['x-gpgauth-user-auth-token'] !== 'undefined') {
        return new Error('x-gpgauth-user-auth-token should not be set during final stage');
      }
      if (typeof this.headers['x-gpgauth-verify-response'] !== 'undefined') {
        return new Error('x-gpgauth-verify-response should not be set during final stage');
      }
      if (typeof this.headers['x-gpgauth-refer'] !== 'string') {
        return new Error('x-gpgauth-refer should be set during final stage');
      }
      return true;

    default:
      return new Error('Unknown GPGAuth stage');
  }
};

export default GpgAuthHeader;
