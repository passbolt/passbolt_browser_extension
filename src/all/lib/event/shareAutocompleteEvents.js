/**
 * Share autocomplete Listeners
 *
 * Used to select a user to share a password with.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var Worker = require('../model/worker');
var TabStorage = require('../model/tabStorage').TabStorage;

var listen = function (worker) {

  /*
   * An aro has been selected to share the secret with.
   *
   * @listens passbolt.share-autocomplete.aro-selected
   * @param aro {array} The selected aro (Could be a user or a group)
   */
  worker.port.on('passbolt.share-autocomplete.aro-selected', function (aro) {
    var sharedPassword = TabStorage.get(worker.tab.id, 'sharedPassword');

    // Add the user to the list of user to share the password with.
    var shareWith = TabStorage.get(worker.tab.id, 'shareWith');
    shareWith.push(aro);
    TabStorage.set(worker.tab.id, 'shareWith', shareWith);

    // Add a temporary permission for the selected user.
    var permission = {
      is_new: true,
      aco: 'Resource',
      aco_foreign_key: sharedPassword.resourceId,
      type: 1
    };

    // If adding a permission for a user.
    if(aro.User) {
      permission.aro = 'User';
      permission.aro_foreign_key = aro.User.id;
      permission.User = aro;
    }
    // Else if adding a permission for a group
    else if(aro.Group) {
      permission.aro = 'Group';
      permission.aro_foreign_key = aro.Group.id;
      permission.Group = aro;
    }

    Worker.get('App', worker.tab.id).port.emit('passbolt.share.add-permission', permission);

    // Reset the autocomplete field.
    Worker.get('Share', worker.tab.id).port.emit('passbolt.share.reset');
  });

};
exports.listen = listen;
