/**
 * Debug Listeners
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Config = require('../model/config');
var preferenceController = require('../controller/preferenceController');

var listen = function (worker) {

  /*
   * Retrieve all the plugin configuration variables.
   *
   * @listens passbolt.debug.config.readAll
   * @param requestId {int} The request identifier
   */
  worker.port.on('passbolt.debug.config.readAll', function (requestId) {
    worker.port.emit('passbolt.debug.config.readAll.complete', requestId, 'SUCCESS', Config.readAll());
  });

  /*
   * Read preference variable.
   *
   * @listens passbolt.debug.browser.readPreference
   * @param requestId {int} The request identifier
   * @param preferenceKey {string} Preference name to obtain
   */
  worker.port.on('passbolt.debug.browser.readPreference', function (requestId, preferenceKey) {
    worker.port.emit('passbolt.debug.browser.readPreference.complete', requestId, 'SUCCESS', preferenceController.get(preferenceKey));
  });

  /*
   * Flush plugin configuration.
   *
   * @listens passbolt.debug.config.flush
   */
  worker.port.on('passbolt.debug.config.flush', function () {
    Config.flush();
  });

  /*
   * Initialize the application pagemod.
   *
   * @listens passbolt.debug.appPagemod.init
   */
  worker.port.on('passbolt.debug.appPagemod.init', function () {
    var app = require('../main');
    app.pageMods.passboltApp.init();
  });
};
exports.listen = listen;
