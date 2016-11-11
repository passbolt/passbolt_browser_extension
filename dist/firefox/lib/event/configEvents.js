/**
 * Config Listeners
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var BrowserSettings = require('../controller/browserSettingsController');
var tabsController = require('../controller/tabsController');
var Config = require('../model/config');
var User = require('../model/user').User;

var listen = function (worker) {

  /*
   * Read configuration variable.
   *
   * @listens passbolt.config.read
   * @param requestId {uuid} The request identifier
   * @param name {string} Variable name to obtain
   */
  worker.port.on('passbolt.config.read', function (requestId, name) {
    worker.port.emit(requestId, 'SUCCESS', Config.read(name));
  });

  /*
   * Read multiple configuration variables.
   *
   * @listens passbolt.config.readAll
   * @param requestId {uuid} The request identifier
   * @param names {array} Variable names to obtain
   */
  worker.port.on('passbolt.config.readAll', function (requestId, names) {
    var conf = {};
    for (var i in names) {
      conf[names[i]] = Config.read(names[i]);
    }
    worker.port.emit(requestId, 'SUCCESS', conf);
  });

  /*
   * Check if the plugin is well configured
   *
   * @listens passbolt.addon.isConfigured
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.addon.isConfigured', function (requestId) {
    var user = new User();
    worker.port.emit(requestId, 'SUCCESS', user.isValid());
  });

  /*
   * Check if the current domain matches the trusted domain defined in configuration.
   * Only works if the plugin is configured.
   *
   * @listens passbolt.addon.checkDomain
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.addon.checkDomain', function (requestId) {
    var trustedDomain = Config.read('user.settings.trustedDomain');
    if(typeof trustedDomain === 'undefined' || trustedDomain == '') {
      worker.port.emit(requestId, 'SUCCESS', false);
    }
    tabsController.getActiveTabUrl()
      .then(function(url) {
        var domainOk = url.startsWith(trustedDomain);
        worker.port.emit(requestId, 'SUCCESS', domainOk);
      });
  });

  /*
   * Get trusted domain.
   *
   * @listens passbolt.addon.getDomain
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.addon.getDomain', function (requestId) {
    var trustedDomain = Config.read('user.settings.trustedDomain');
    worker.port.emit(requestId, 'SUCCESS', trustedDomain);
  });

  /*
   * Set a configuration variable.
   *
   * @listens passbolt.config.write
   * @param requestId {uuid} The request identifier
   * @param name {string} Variable name to store
   * @param value {mixed} Variable value
   */
  worker.port.on('passbolt.config.write', function (requestId, name, value) {
    var write = Config.write(name, value);
    if (write) {
      worker.port.emit(requestId, 'SUCCESS');
    }
  });

  /*
   * Get plugin version.
   *
   * @listens passbolt.addon.getDomain
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.addon.getVersion', function (requestId) {
    worker.port.emit(requestId, 'SUCCESS', BrowserSettings.getExtensionVersion());
  });
};
exports.listen = listen;