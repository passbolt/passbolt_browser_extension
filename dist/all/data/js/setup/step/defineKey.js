/**
 * Passbolt define key setup step.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

  /*
   * Step settings.
   */
  var step = {
    id: 'define_key',
    elts: {
      importButton: '#js_setup_goto_import_key',
      ownerName: '#OwnerName',
      ownerEmail: '#OwnerEmail',
      keyComment: '#KeyComment',
      keyType: '#KeyType',
      keyLength: '#KeyLength',
      keyExpiryDate: '#KeyExpire',
      feedbackError: '#js_main_error_feedback'
    },
    data: {}
  };

  /**
   * Implements init().
   * @returns {promise}
   */
  step.init = function () {

    return step._getData()
      .then(function (data) {
        step.viewData.username = step.data.username = data.user.username;
        step.viewData.firstName = step.data.firstname = data.user.firstname;
        step.viewData.lastName = step.data.lastname = data.user.lastname;
        step.viewData.comment = step.data.comment = (data.key.comment != undefined ? data.key.comment : '');
        step.viewData.domain = step.data.domain = data.settings.domain;
      });
  };

  /**
   * Implements start().
   */
  step.start = function () {
    // Define default values for key length and type.
    step.elts.$keyLength.val(step.options.defaultKeyLength);
    step.elts.$keyType.val(step.options.defaultKeyType);

    // Bind the go to import an existing key button.
    step.elts.$importButton.click(step.onImportButtonClick);
  };

  /**
   * Implements submit().
   * @returns {promise}
   */
  step.submit = function () {
    // Set submit button into processing state.
    passbolt.setup.setActionState('submit', 'processing');

    var key = {
      ownerName: step.data.firstname + ' ' + step.data.lastname,
      ownerEmail: step.data.username,
      comment: step.elts.$keyComment.val(),
      length: step.elts.$keyLength.val(),
      algorithm: step.elts.$keyType.val()
    };

    var validated = step._validateKeyInfo(key).then(function () {
      // Store setup data.
      passbolt.setup.set('key', key);
    });

    return validated;
  };

  /**
   * Implements cancel().
   * @returns {promise}
   */
  step.cancel = function () {
    passbolt.setup.setActionState('cancel', 'processing');
    var def = $.Deferred();
    def.resolve();
    return def;
  };

  /* ==================================================================================
   *  Content code events
   * ================================================================================== */

  /**
   * On click event on the import button.
   * @param ev {HTMLEvent} The event which occurred
   */
  step.onImportButtonClick = function (ev) {
    ev.preventDefault();
    passbolt.setup.switchToStep('import_key');
  };

  /**
   * On error.
   * Is called for general errors that doesn't require specific behavior.
   * @param errorMsg {strong} The error message
   * @param validationErrors {array} Array of errors by fields
   */
  step.onError = function (errorMsg, validationErrors) {

    var html = '<p>Error : ' + errorMsg + '</p>';
    if (validationErrors != undefined) {
      html += '<ul>';
      for (var i in validationErrors) {
        var valError = validationErrors[i];
        html += '<li>' + valError[Object.keys(valError)[0]] + '</li>';
      }
      html += '</ul>';
    }

    step.elts.$feedbackError
      .removeClass('hidden')
      .html(html);
  };

  /* ==================================================================================
   *  Business functions
   * ================================================================================== */

  /**
   * Get the data needed to start this step from plugin, and
   * Display an error in case it could not be retrieved.
   * @returns {promise}
   * @private
   */
  step._getData = function () {
    return passbolt.setup.get()
      .then(null, function (errorMsg) {
        step.onError(errorMsg);
      });
  };

  /**
   * Validate key info.
   * @param keyInfo {object} Key settings
   * @returns {promise}
   * @private
   */
  step._validateKeyInfo = function (keyInfo) {
    return passbolt.request('passbolt.keyring.key.validate', keyInfo, ['ownerName', 'ownerEmail', 'comment', 'length', 'algorithm'])
      .then(null, function (errorMsg, validationErrors) {
        step.onError(errorMsg, validationErrors);
        // back to ready state.
        passbolt.setup.setActionState('submit', 'enabled');
      });
  };

  passbolt.setup.steps[step.id] = step;

})(passbolt);
