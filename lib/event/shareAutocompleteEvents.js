/**
 * Share autocomplete Listeners
 *
 * Used to select a user to share a password with.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var Worker = require('../model/worker');
var TabStorage = require('../model/tabStorage').TabStorage;

var listen = function (worker) {

  /*
   * A user has been selected to share the secret with.
   *
   * @listens passbolt.share-autocomplete.user-selected
   * @param user {array} The selected user
   */
  worker.port.on('passbolt.share-autocomplete.user-selected', function (user) {
    var sharedPassword = TabStorage.get(worker.tab.id, 'sharedPassword');

    // Add the user to the list of user to share the password with.
    var shareWith = TabStorage.get(worker.tab.id, 'shareWith');
    shareWith.push(user.User.id);
    TabStorage.set(worker.tab.id, 'shareWith', shareWith);

    // Add a temporary permission for the selected user.
    var permission = {
      is_new: true,
      aco: 'Resource',
      aco_foreign_key: sharedPassword.resourceId,
      aro: 'User',
      aro_foreign_key: user.User.id,
      type: 1,
      User: user
    };
    Worker.get('App', worker.tab.id).port.emit('passbolt.share.add-permission', permission);

    // Reset the autocomplete field.
    Worker.get('Share', worker.tab.id).port.emit('passbolt.share.reset');
  });

};
exports.listen = listen;
