/**
 * Config Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const BrowserSettings = require('../controller/browserSettingsController');
const Config = require('../model/config');
const User = require('../model/user').User;

const listen = function(worker) {
  /*
   * Read configuration variable.
   *
   * @listens passbolt.config.read
   * @param requestId {uuid} The request identifier
   * @param name {string} Variable name to obtain
   */
  worker.port.on('passbolt.config.read', (requestId, name) => {
    worker.port.emit(requestId, 'SUCCESS', Config.read(name));
  });

  /*
   * Read multiple configuration variables.
   *
   * @listens passbolt.config.readAll
   * @param requestId {uuid} The request identifier
   * @param names {array} Variable names to obtain
   */
  worker.port.on('passbolt.config.readAll', (requestId, names) => {
    const conf = {};
    for (const i in names) {
      conf[names[i]] = Config.read(names[i]);
    }
    worker.port.emit(requestId, 'SUCCESS', conf);
  });

  /*
   * Check if the plugin is well configured
   *
   * @listens passbolt.addon.is-configured
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.addon.is-configured', requestId => {
    const user = User.getInstance();
    worker.port.emit(requestId, 'SUCCESS', user.isValid());
  });

  /*
   * Check if the current domain matches the trusted domain defined in configuration.
   * Only works if the plugin is configured.
   *
   * @listens passbolt.addon.check-domain
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.addon.check-domain', requestId => {
    const trustedDomain = Config.read('user.settings.trustedDomain');
    if (typeof trustedDomain === 'undefined' || trustedDomain == '') {
      worker.port.emit(requestId, 'SUCCESS', false);
    }

    const domainOk = worker.tab.url.startsWith(trustedDomain);
    worker.port.emit(requestId, 'SUCCESS', domainOk);
  });

  /*
   * Get trusted domain.
   *
   * @listens passbolt.addon.get-domain
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.addon.get-domain', requestId => {
    const trustedDomain = Config.read('user.settings.trustedDomain');
    worker.port.emit(requestId, 'SUCCESS', trustedDomain);
  });

  /*
   * Get plugin version.
   *
   * @listens passbolt.addon.get-version
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.addon.get-version', requestId => {
    worker.port.emit(requestId, 'SUCCESS', BrowserSettings.getExtensionVersion());
  });

  /*
   * Get plugin url.
   *
   * @listens passbolt.addon.get-url
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.addon.get-url', requestId => {
    worker.port.emit(requestId, 'SUCCESS', chrome.runtime.getURL(''));
  });
};
exports.listen = listen;
