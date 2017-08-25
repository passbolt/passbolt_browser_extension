/**
 * Passbolt backup key setup step.
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
    id: 'backup_key',
    elts: {
      downloadButton: '#js_backup_key_download'
    }
  };

  /**
   * Implements init().
   * @returns {Promise}
   */
  step.init = function () {
    return new Promise(function(resolve, reject) {
      resolve();
    });
  };

  /**
   * Implements start().
   */
  step.start = function () {
    step.elts.$downloadButton.on('click', function (ev) {
      step.onClickDownload();
    });
  };

  /**
   * Implements submit().
   * @returns {Promise}
   */
  step.submit = function () {
    return new Promise(function(resolve, reject) {
      passbolt.setup.setActionState('submit', 'processing');
      resolve();
    });
  };

  /**
   * Implements cancel().
   * @returns {Promise}
   */
  step.cancel = function () {
    return new Promise(function(resolve, reject) {
      passbolt.setup.setActionState('cancel', 'processing');
      resolve();
    });
  };

  /* ==================================================================================
   *  Content code events
   * ================================================================================== */

  /**
   * Handle the onClick event on the download button.
   */
  step.onClickDownload = function () {
    // Get private armored key.
    passbolt.setup.get('key.privateKeyArmored').then(function (privateKeyArmored) {
      // Start download.
      passbolt.request('passbolt.keyring.key.backup', privateKeyArmored, 'passbolt_private.asc')
        .then(function () {
          // The key has been saved.
        });
    });
  };

  passbolt.setup.steps[step.id] = step;

});
