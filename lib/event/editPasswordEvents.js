/**
 * Edited password events.
 *
 * Used to handle the events related to the edition of a password.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var TabStorage = require('../model/tabStorage').TabStorage;

var listen = function (worker) {

  /*
   * Set the edited password.
   *
   * @listens passbolt.edit-password.set-edited-password
   * @param requestId {int} The request identifier
   * @param editedPassword {array} The edited password
   */
  worker.port.on('passbolt.edit-password.set-edited-password', function (requestId, editedPassword) {
    TabStorage.set(worker.tab.id, 'editedPassword', editedPassword);
    worker.port.emit('passbolt.edit-password.set-edited-password.complete', requestId, 'SUCCESS');
  });

  /*
   * Get the edited password.
   *
   * @listens passbolt.edit-password.get-edited-password
   * @param requestId {int} The request identifier
   */
  worker.port.on('passbolt.edit-password.get-edited-password', function (requestId) {
    var editedPassword = TabStorage.get(worker.tab.id, 'editedPassword');
    worker.port.emit('passbolt.edit-password.get-edited-password.complete', requestId, 'SUCCESS', editedPassword);
  });

};
exports.listen = listen;