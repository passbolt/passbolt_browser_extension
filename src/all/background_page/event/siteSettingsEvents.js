/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SARL (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 */
var User = require('../model/user').User;
var SiteSettings = require('../model/siteSettings').SiteSettings;

var listen = function (worker) {

  /*
   * Get the current site settings as stored in the plugin.
   *
   * @listens passbolt.site.settings
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.site.settings', function (requestId) {
    try {
      var user = User.getInstance();
      var domain = user.settings.getDomain();
      var settings = new SiteSettings(domain);
      settings.get().then(
        function success(data) {
          worker.port.emit(requestId, 'SUCCESS', data);
        },
        function error(e) {
          worker.port.emit(requestId, 'ERROR', e.message);
        });
    } catch (e) {
      worker.port.emit(requestId, 'ERROR', e.message);
    }
  });

/*
 * Get the remember me settings from server
 *
 * @listens passbolt.site.settings.remember
 * @param requestId {uuid} The request identifier
 */
  worker.port.on('passbolt.site.settings.plugins.rememberMe', function (requestId) {
    try {
      var user = User.getInstance();
      var domain = user.settings.getDomain();
      var settings = new SiteSettings(domain);
      settings.getRememberMeOptions().then(
        function success(data) {
          worker.port.emit(requestId, 'SUCCESS', data);
        });
    } catch (e) {
      worker.port.emit(requestId, 'ERROR', e.message);
    }
  });
};
exports.listen = listen;