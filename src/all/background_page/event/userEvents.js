/**
 * User events
 *
 * Used to handle the events related to the current user
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../app');
var User = require('../model/user').User;
var user = User.getInstance();
var __ = require('../sdk/l10n').get;

var listen = function (worker) {

  /* ==================================================================================
   *  Getters for user
   * ================================================================================== */

  /*
   * Get the current user as stored in the plugin.
   *
   * @listens passbolt.user.get
   * @param requestId {uuid} The request identifier
   * @param data {array} The user filter
   */
  worker.port.on('passbolt.user.get', function (requestId, data) {
    try {
      var u = user.get(data);
      worker.port.emit(requestId, 'SUCCESS', u);
    } catch (e) {
      worker.port.emit(requestId, 'ERROR', e.message);
    }
  });

  /*
   * Get the user security token as stored in the plugin
   *
   * @listens passbolt.user.settings.get.securityToken
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.user.settings.get.securityToken', function (requestId) {
    try {
      var securityToken = user.settings.getSecurityToken();
      worker.port.emit(requestId, 'SUCCESS', securityToken);
    } catch (e) {
      worker.port.emit(requestId, 'ERROR', e.message);
    }
  });

  /*
   * Get the user security token as stored in the plugin
   *
   * @listens passbolt.user.settings.get.securityToken
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.user.settings.get.theme', function (requestId) {
    try {
      var theme = user.settings.getTheme();
      worker.port.emit(requestId, 'SUCCESS', theme);
    } catch (e) {
      worker.port.emit(requestId, 'ERROR', e.message);
    }
  });

  /*
   * Get the user domain trust as stored in the plugin
   *
   * @listens passbolt.user.settings.get.domain
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.user.settings.get.domain', function (requestId) {
    try {
      var domain = user.settings.getDomain();
      worker.port.emit(requestId, 'SUCCESS', domain);
    } catch (e) {
      worker.port.emit(requestId, 'ERROR', e.message);
    }
  });


  /* ==================================================================================
   *  Setters for user
   * ================================================================================== */

  /*
   * Set the user in the plugin local storage
   *
   * @listens passbolt.user.set
   * @param requestId {uuid} The request identifier
   * @param u {array} The user object
   */
  worker.port.on('passbolt.user.set', function (requestId, u) {
    try {
      user.set(u);
      app.pageMods.PassboltAuth.init();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (e) {
      worker.port.emit(requestId, 'ERROR', e.message);
    }
  });

  /*
   * Update the user settings using remote API
   *
   * @listens passbolt.user.set
   * @param requestId {uuid} The request identifier
   * @param u {array} The user object
   */
  worker.port.on('passbolt.user.settings.sync', function (requestId) {
    user.settings.sync().then(() => {
      worker.port.emit(requestId, 'SUCCESS');
    }, (e) => {
      worker.port.emit(requestId, 'ERROR', e.message);
    });
  });

  /* ==================================================================================
   *  Others
   * ================================================================================== */

  /*
   * Validate the user object given and return errors if any.
   *
   * @listens passbolt.user.validate
   * @param requestId {uuid} The request identifier
   * @param u {array} The user object to validate
   * @param fields {array} The fields to validate
   */
  worker.port.on('passbolt.user.validate', function (requestId, u, fields) {
    try {
      var validatedUser = user.validate(u, fields);
      worker.port.emit(requestId, 'SUCCESS', validatedUser);
    } catch (e) {
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(e));
    }
  });

  /*
   * Validate the user settings object given and return errors if any.
   *
   * @listens passbolt.user.settings.validate
   * @param requestId {uuid} The request identifier
   * @param settingsData {array} The user settings object to validate
   * @param fields {array} The fields to validate
   */
  worker.port.on('passbolt.user.settings.validate', function (requestId, settingsData, fields) {
    try {
      user.settings.validate(settingsData, fields);
      worker.port.emit(requestId, 'SUCCESS', settingsData);
    } catch (e) {
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(e));
    }
  });
};
exports.listen = listen;
