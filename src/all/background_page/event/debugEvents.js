/**
 * Debug Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const app = require('../app');
const Config = require('../model/config');
const Log = require('../model/log').Log;
const BrowserSettings = require('../controller/browserSettingsController');
const ToolbarController = require('../controller/toolbarController').ToolbarController;
const {Keyring} = require('../model/keyring');
const keyring = new Keyring();
const {User} = require('../model/user');

const listen = function (worker) {

  /*
   * Retrieve all the plugin configuration variables.
   *
   * @listens passbolt.debug.config.readAll
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.debug.config.readAll', function (requestId) {
    var config = Config.readAll();
    worker.port.emit(requestId, 'SUCCESS', config);
  });

  /*
   * Read preference variable.
   *
   * @listens passbolt.debug.browser.readPreference
   * @param requestId {uuid} The request identifier
   * @param preferenceKey {string} Preference name to obtain
   */
  worker.port.on('passbolt.debug.browser.readPreference', function (requestId, preferenceKey) {
    worker.port.emit(requestId, 'SUCCESS', BrowserSettings.get(preferenceKey));
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
    var app = require('../app');
    app.pageMods.AppBoostrap.init();
  });

  /*
   * Simulate toolbar icon click.
   *
   * @listens passbolt.debug.simulateToolbarIconClick
   */
  worker.port.on('passbolt.debug.simulateToolbarIconClick', function () {
    var toolbarController = new ToolbarController();
    toolbarController.openPassboltTab();
  });

  /*
   * Get logs.
   *
   * @listens passbolt.debug.getLogs
   */
  worker.port.on('passbolt.debug.log.readAll', function (requestId) {
    worker.port.emit(requestId, 'SUCCESS', Log.readAll());
  });

  /*
   * Open a new tab.
   *
   * @listens passbolt.debug.open-tab
   * @param requestId {uuid} The request identifier
   * @param url {string} The url to open in the new tab.
   */
  worker.port.on('passbolt.debug.open-tab', function (url) {
    tabsController.open(url);
  });

  /*
   * Log.
   *
   * @listens passbolt.debug.log
   * @param requestId {uuid} The request identifier
   * @param data {mixed} The data to log.
   */
  worker.port.on('passbolt.debug.log', function (data) {
    Log.write({level: 'error', message: data});
  });

  /*
   * Get the user private key object
   *
   * @listens passbolt.keyring.private.get
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.keyring.private.get', function (requestId) {
    const info = keyring.findPrivate();
    if (typeof info !== 'undefined') {
      worker.port.emit(requestId, 'SUCCESS', info);
    } else {
      worker.port.emit(requestId, 'ERROR');
    }
  });


  /*
   * Import the user private armored key.
   *
   * @listens passbolt.keyring.private.import
   * @param requestId {uuid} The request identifier
   * @param privateKeyArmored {string} The private armored key to import
   */
  worker.port.on('passbolt.keyring.private.import', async function (requestId, privateKeyArmored) {
    try {
      await keyring.importPrivate(privateKeyArmored);
      const publicKeyArmored = await keyring.extractPublicKey(privateKeyArmored);
      const user = User.getInstance();
      await keyring.importPublic(publicKeyArmored, user.get().id);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', privateKeyArmored);
    }
  });

  /*
   * Import the server public armored key.
   *
   * @listens passbolt.keyring.server.import
   * @param requestId {uuid} The request identifier
   * @param publicKeyArmored {string} The public armored key to import
   */
  worker.port.on('passbolt.keyring.server.import', function (requestId, publicKeyArmored) {
    const user = User.getInstance();
    keyring.importServerPublicKey(publicKeyArmored, user.settings.getDomain()).then(function() {
      worker.port.emit(requestId, 'SUCCESS');
    }, function (error) {
      worker.port.emit(requestId, 'ERROR', error.message)
    });
  });

  /*
   * Set the user in the plugin local storage
   *
   * @listens passbolt.user.set
   * @param requestId {uuid} The request identifier
   * @param u {array} The user object
   */
  worker.port.on('passbolt.user.set', function (requestId, u) {
    try {
      User.getInstance().set(u);
      app.pageMods.AuthBootstrap.init();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (e) {
      worker.port.emit(requestId, 'ERROR', e.message);
    }
  });
};
exports.listen = listen;
