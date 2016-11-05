/**
 * Bootstrap events
 *
 * Used to handle the events reloading pagemods or launching add.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('sdk/self');
var app = require('../app');
var Config = require('../model/config');
var tabsController = require('../controller/tabsController');
var __ = require("sdk/l10n").get;

var listen = function (worker) {

  /*
   * Initialize the authentication process.
   *
   * @listens passbolt.bootstrap.login
   * @param requestId {uuid} The request identifier
   */
  //worker.port.on('passbolt.bootstrap.login', function (requestId) {
  //  // Destroy the passbolt application authentication pageMod.
  //  // And trigger a page refresh to restart it to make it work on the current page if changed
  //  console.log('auth init bootstrap');
  //  if (app.pageMods.PassboltAuth.init()) {
  //    worker.port.emit(requestId, 'SUCCESS', true);
  //  } else {
  //    worker.port.emit(requestId, 'ERROR', true);
  //  }
  //});

  /*
   * Open the plugin debug page.
   *
   * @listens passbolt.bootstrap.debug
   * @param requestId {uuid} The request identifier
   */
  //worker.port.on('passbolt.bootstrap.debug', function (requestId) {
  //  if (Config.isDebug() == true) {
  //    tabsController.setActiveTabUrl(self.data.url('config-debug.html'));
  //    worker.port.emit(requestId, 'SUCCESS');
  //  } else {
  //    worker.port.emit(requestId, 'ERROR');
  //  }
  //});

};
exports.listen = listen;
