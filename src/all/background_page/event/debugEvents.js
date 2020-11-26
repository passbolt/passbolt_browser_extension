/**
 * Debug Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Log = require('../model/log').Log;
var tabsController = require('../controller/tabsController');
const {Keyring} = require('../model/keyring');
const keyring = new Keyring();
const {User} = require('../model/user');

var listen = function (worker) {

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

};
exports.listen = listen;
