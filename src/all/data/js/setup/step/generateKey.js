/**
 * Passbolt generate key setup step.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

$(function () {

  /*
   * Step settings.
   */
  var step = {
    id: 'generate_key'
  };

  /**
   * Implements init().
   * @returns {Promise}
   */
  step.init = function () {
    return new Promise(function(resolve, reject) {
      resolve()
    });
  };

  /**
   * Implements start().
   */
  step.start = function () {
    // We don't need the submit button here. Removing it.
    $('#js_setup_submit_step').remove();

    // Get key info from setup.
    passbolt.setup.get('key')
      .then(function (keyInfo) {

        // Generate key pair, and import it in keyring.
        step._generateKeyPair(keyInfo, keyInfo.passphrase)
        // Once the key pair is generated.
          .then(step._importIntoKeyring)
          .then(step.onKeyGenerated)
          .then(null, function (e) {
            step.onError(e);
          });
      });
  };

  /**
   * Implements submit().
   * @returns {Promise}
   */
  step.submit = function () {
    return new Promise(function(resolve, reject) {
      passbolt.setup.setActionState('submit', 'processing');
      resolve()
    });
  };

  /**
   * Implements cancel().
   * @returns {Promise}
   */
  step.cancel = function () {
    return new Promise(function(resolve, reject) {
      passbolt.setup.setActionState('cancel', 'processing');
      resolve()
    });
  };

  /* ==================================================================================
   *  Chainable functions
   * ================================================================================== */

  /**
   * Generate key pair.
   * @param keyInfo {object} The key settings
   * @param passphrase {string} The passphrase for the master key
   * @returns {Promise}
   * @see keyinfo format in Key model
   * @private
   */
  step._generateKeyPair = function (keyInfo, passphrase) {
    return passbolt.request("passbolt.keyring.generateKeyPair", keyInfo, passphrase)
      .then(function (keyPair) {
        keyInfo.publicKeyArmored = keyPair.publicKeyArmored;
        keyInfo.privateKeyArmored = keyPair.privateKeyArmored;
        return keyInfo;
      });
  };

  /**
   * Import private key into the keyring.
   * @param keyInfo {object} key information
   * @returns {Promise}
   * @private
   */
  step._importIntoKeyring = function (keyInfo) {
    return passbolt.setup.set('key', keyInfo);
  };

  /* ==================================================================================
   *  Content code events
   * ================================================================================== */

  /**
   * On key generated event.
   * To be called when the key pair is generated and imported.
   */
  step.onKeyGenerated = function () {
    passbolt.setup.setActionState('submit', 'enabled');
    passbolt.setup.goForward('backup_key');
  };

  /**
   * On error.
   * @param errorMsg {string}
   */
  step.onError = function (errorMsg) {
    passbolt.setup.fatalError(errorMsg);
  };

  passbolt.setup.steps[step.id] = step;

});
