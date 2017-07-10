/**
 * Key model.
 *
 * Provides validation methods for a key.
 * Was created initially to validate the key config before its generation.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
// var Validator = require('../vendors/validator');
var __ = require('../sdk/l10n').get;

/**
 * The class that deals with keys.
 */
var Key = function () {
  // Key data.
  this._key = {
    algorithm: '',
    length: '',
    comment: '',
    ownerName: '',
    ownerEmail: '',
    userId: '',
    passphrase: ''
  };
};

/**
 * Validate key fields individually.
 * @param field {string} The name of the field to validate
 * @param value {string} The value of the field to validate
 * @returns {boolean}
 * @throw Error if the field is not valid
 * @private
 */
Key.prototype.__validate = function (field, value) {
  switch (field) {
    case 'algorithm':
      if (typeof value === 'undefined' || value === '') {
        throw new Error(__('The key algorithm cannot be empty'));
      }
      var supportedAlgorithms = [
        "RSA-DSA"
      ];
      if (supportedAlgorithms.indexOf(value) == -1) {
        throw new Error(__('The key algorithm selected is not supported'));
      }
      break;
    case 'length' :
      if (typeof value === 'undefined' || value === '') {
        throw new Error(__('The length cannot be empty'));
      }
      var supportedLength = [
        "2048"
      ];
      if (supportedLength.indexOf(value) == -1) {
        throw new Error(__('The key length selected is not supported'));
      }
      break;
    case 'comment' :
      // We accept everything except ().
      if (Validator.matches(value, /[()]/)) {
        throw new Error(__('The comment contains invalid characters : ()'));
      }
      break;
    case 'ownerName' :
      if (typeof value === 'undefined' || value === '') {
        throw new Error(__('The owner name cannot be empty'));
      }
      if (!Validator.isAlphanumericSpecial(value)) {
        throw new Error(__('The full name should contain only alphabetical characters and spaces'));
      }
      break;
    case 'ownerEmail' :
      if (!Validator.isEmail(value)) {
        throw new Error(__('The owner email should be a valid email'));
      }
      break;
    case 'userId' :
      if (!Validator.matches(value, /^[0-9A-Za-z\u00C0-\u017F\-' ]+ (\(\[0-9A-Za-z\u00C0-\u017F\-' ]+\)? (<[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}>){1})$/i)) {
        throw new Error(__('The userId should follow a correct format ' + value));
      }
      break;
    case 'passphrase' :
      if (!Validator.isLength(value, 8)) {
        throw new Error(__('The passphrase should be at least 8 characters'));
      }
      break;
    default :
      throw new Error(__('No validation defined for field: ' + field));
      break;
  }
  return true;
};

/**
 * Validate the key settings.
 * @param key {array} The key to validate
 * @param fields {array} The names of the fields to validate
 * @returns {array} The key in case of success
 * @throw Error if the key is not valid
 */
Key.prototype.validate = function (key, fields) {
  if (fields == undefined) {
    fields = ['ownerName', 'ownerEmail', 'userId', 'passphrase', 'comment'];
  }

  var errors = [];
  for (var i in fields) {
    var fieldName = fields[i];
    try {
      this.__validate(fieldName, key[fieldName]);
    } catch (e) {
      var fieldError = {};
      fieldError[fieldName] = e.message;
      errors.push(fieldError);
    }
  }

  if (errors.length > 0) {
    // Return exception with details in validationErrors.
    var e = new Error(__('key could not be validated'));
    // Add validation errors to the error object.
    e.validationErrors = errors;
    throw e;
  }

  return key;
};

/**
 * Set the key settings.
 * @param key {array} The key to set
 * @return {bool} true if successful
 */
Key.prototype.set = function (key) {

  if (typeof key === 'undefined') {
    throw new Error(__('The key cannot be empty'));
  }

  this.setOwnerName(key.ownerName);
  this.setOwnerEmail(key.ownerEmail);
  this.setAlgorithm(key.algorithm);
  this.setComment(key.comment);
  this.setLength(key.length);

  // Handle userId.
  if (key.userId != undefined || key.userId == '') {
    this.setUserId(key.userId);
  }

  return true;
};

/**
 * Set a length for the key.
 * @param length {string} The key length
 * @throw Error when length is not a supported one
 */
Key.prototype.setLength = function (length) {
  this.__validate('length', length);
  this._key.length = length;
  return this._key;
};

/**
 * Set an algorithm for the key.
 * @param algorithm {string} The key algorithm
 * @throw Error when algorithm is not a supported one
 */
Key.prototype.setAlgorithm = function (algorithm) {
  this.__validate('algorithm', algorithm);
  this._key.algorithm = algorithm;
  return this._key;
};

/**
 * Set a comment for the key.
 * @param comment {string} The key comment
 * @throw Error when comment is not a supported one
 */
Key.prototype.setComment = function (comment) {
  this.__validate('comment', comment);
  this._key.comment = comment;
  return this._key;
};


/**
 * Set a user id for the key.
 * @param userId {string} The key user id
 * @throw Error when the user id is not valid
 */
Key.prototype.setUserId = function (userId) {
  this.__validate('userId', userId);
  this._key.userId = userId;
  return this._key;
};

/**
 * Set an owner name for the key.
 * @param ownerName {string} The key owner name
 * @throw Error when owner name is not valid
 */
Key.prototype.setOwnerName = function (ownerName) {
  this.__validate('ownerName', ownerName);
  this._key.ownerName = ownerName;
  return this._key;
};

/**
 * Set an owner email for the key.
 * @param ownerEmail {string} The key owner email
 * @throw Error when the owner email is not valid
 */
Key.prototype.setOwnerEmail = function (ownerEmail) {
  this.__validate('ownerEmail', ownerEmail);
  this._key.ownerEmail = ownerEmail;
  return this._key;
};

/**
 * Set a passphrase for the key.
 * @param passphrase {string} The key passphrase
 * @throw Error when passphrase is not valid
 */
Key.prototype.setPassphrase = function (passphrase) {
  this.__validate('passphrase', passphrase);
  this._key.passphrase = passphrase;
  return this._key;
};

/**
 * Get the key settings.
 * @param fields {array} (optional) An array of key settings, if not provided
 *  return all the key settings
 * @returns {array}
 */
Key.prototype.get = function (fields) {
  var key = {};

  var keyDefaultFields = [
    "userId",
    "length",
    "algorithm",
    "comment",
    "passphrase"
  ];

  if (fields == undefined) {
    fields = keyDefaultFields;
  }

  for (var i in fields) {
    var varName = fields[i];
    key[varName] = this._key[varName];
  }

  return key;
};

/**
 * Get the key length.
 * @return {string}
 */
Key.prototype.getLength = function () {
  return this._key.length;
};

/**
 * Get the key algorithm.
 * @return {string}
 */
Key.prototype.getAlgorithm = function () {
  return this._key.algorithm;
};

/**
 * Get the key comment.
 * @return {string}
 */
Key.prototype.getComment = function () {
  return this._key.comment;
};

/**
 * Get the key user id.
 * @return {string}
 */
Key.prototype.getUserId = function () {
  if (this._key.userId == undefined || this._key.userId == '') {
    this._key.userId = this.buildUserId();
  }
  return this._key.userId;
};

/**
 * Get the key owner name.
 * @return {string}
 */
Key.prototype.getOwnerName = function () {
  return this._key.ownerName;
};

/**
 * Get the key owner email.
 * @return {string}
 */
Key.prototype.getOwnerEmail = function () {
  return this._key.ownerEmail;
};

/**
 * Get the key passphrase.
 * @return {string}
 */
Key.prototype.getPassphrase = function () {
  return this._key.passphrase;
};

/**
 * Build userId from name email and comment, following GPG standard.
 * @returns {*} False if owner name or owner email missing else the user id
 *  as following : OwnerName (Comment) <OwnerEmail>
 */
Key.prototype.buildUserId = function () {
  if (this._key.ownerName == undefined || this._key.ownerEmail == undefined) {
    return false;
  }
  var userId = '';
  userId += this._key.ownerName;
  userId += this._key.comment != undefined && this._key.comment != '' ?
    (' (' + this._key.comment + ')') : '';
  userId += (' <' + this._key.ownerEmail + '>');

  return userId;
};

// Exports the Key object.
exports.Key = Key;
