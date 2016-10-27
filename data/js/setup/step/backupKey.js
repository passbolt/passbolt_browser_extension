/**
 * Passbolt backup key setup step.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
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
    id: 'backup_key',
    elts: {
      downloadButton: '#js_backup_key_download'
    }
  };

  /**
   * Implements init().
   * @returns {promise}
   */
  step.init = function () {
    var def = $.Deferred();
    def.resolve();
    return def;
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
   * @returns {promise}
   */
  step.submit = function () {
    passbolt.setup.setActionState('submit', 'processing');

    var def = $.Deferred();
    def.resolve();
    return def;
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

})(passbolt);
