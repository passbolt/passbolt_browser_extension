/**
 * Setup Events
 *
 * Listen to events related to the setup
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Setup = require('../model/setup').Setup;
var Key = require('../model/key').Key;
var app = require('../app');

var setup = new Setup();

var listen = function (worker) {

  /*
   * Set setup variable.
   *
   * @listens passbolt.setup.set
   * @param requestId {uuid} The request identifier
   * @param key {string} Variable name to store
   * @param value {string} Variable value
   */
  worker.port.on('passbolt.setup.set', function (requestId, key, value) {
    try {
      var setupData = setup.set(key, value);
      worker.port.emit(requestId, 'SUCCESS', setupData);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error.message);
    }
  });

  /*
   * Get setup variable.
   *
   * @listens passbolt.setup.get
   * @param requestId {uuid} The request identifier
   * @param key {string} Variable name to store
   */
  worker.port.on('passbolt.setup.get', function (requestId, key) {
    try {
      var setupData = setup.get(key);
      worker.port.emit(requestId, 'SUCCESS', setupData);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error.message);
    }
  });

  /*
   * Go to next section in the navigation.
   *
   * @listens passbolt.setup.navigation.next
   * @param requestId {uuid} The request identifier
   * @param stepId {string} The step identifier to go to
   */
  worker.port.on('passbolt.setup.navigation.next', function (requestId, stepId) {
    try {
      var myStepId = setup.navigationNext(stepId);
      worker.port.emit(requestId, 'SUCCESS', myStepId);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error.message);
    }
  });

  /*
   * Go back to previous section in the navigation.
   *
   * @listens passbolt.setup.navigation.back
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.setup.navigation.back', function (requestId) {
    try {
      var lastStep = setup.navigationBack();
      worker.port.emit(requestId, 'SUCCESS', lastStep);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error.message);
    }
  });

  /*
   * Get the navigation history.
   *
   * @listens passbolt.setup.navigation.get.history
   */
  worker.port.on('passbolt.setup.navigation.get.history', function (requestId) {
    try {
      var history = setup.getNavigationHistory();
      worker.port.emit(requestId, 'SUCCESS', history);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error.message);
    }
  });

  /*
   * Flush setup data.
   *
   * @listens passbolt.setup.flush
   */
  worker.port.on('passbolt.setup.flush', function (requestId) {
    try {
      setup.flush();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error.message);
    }
  });

  /*
   * Check if key exists on server.
   *
   * @listens passbolt.setup.checkKeyExistRemotely
   * @param fingerprint {string} The key fingerprint to check
   */
  worker.port.on('passbolt.setup.checkKeyExistRemotely', function (requestId, fingerprint) {
    try {
      setup.checkKeyExistRemotely(fingerprint)
        .then(
          function () {
            worker.port.emit(requestId, 'SUCCESS');
          },
          function (error) {
            worker.port.emit(requestId, 'ERROR', error.message);
          }
        );
    }
    catch (error) {
      worker.port.emit(requestId, 'ERROR', error.message);
    }
  });

  /*
   * Save the setup gathered information.
   *
   * @listens passbolt.setup.save
   * @param data {arary} The setup information
   */
  worker.port.on('passbolt.setup.save', function (requestId, data) {
    setup.save(data)
      .then(
        function () {
          app.pageMods.PassboltAuth.init();
          worker.port.emit(requestId, 'SUCCESS');
        },
        function (error) {
          worker.port.emit(requestId, 'ERROR', error);
        }
      );
  });

  /*
   * Complete the recovery and the save the gathered information.
   *
   * @listens passbolt.setup.completeRecovery
   * @param data {arary} The recovery information
   */
  worker.port.on('passbolt.setup.completeRecovery', function (requestId, data) {
    setup.completeRecovery(data)
      .then(
        function () {
          app.pageMods.PassboltAuth.init();
          worker.port.emit(requestId, 'SUCCESS');
        },
        function (error) {
          worker.port.emit(requestId, 'ERROR', error);
        }
      );
  });

};
exports.listen = listen;