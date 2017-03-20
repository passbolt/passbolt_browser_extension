/**
 * Group autocomplete Listeners
 *
 * Used to select a user to add to a group.
 *
 * @copyright (c) 2017-present Passbolt SARL
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
    worker.port.on('passbolt.group.edit-autocomplete.user-selected', function (user) {
        var groupId = TabStorage.get(worker.tab.id, 'groupId');

        // Add the user to the list of user to share the password with.
        var groupUsers = TabStorage.get(worker.tab.id, 'groupUsers');

        // Check if there is already one admin.
        var adminExisting = false;
        for (var i in groupUsers) {
            if (groupUsers[i].is_admin == 1) {
                adminExisting = true;
            }
        }

        // Build groupUser object.
        var groupUser= {
            user_id: user.User.id,
            is_admin: adminExisting == true ? 0 : 1,
            User: user
        };

        // Add object to groupUsers list in tab storage.
        groupUsers.push(groupUser);
        TabStorage.set(worker.tab.id, 'groupUsers', groupUsers);

        Worker.get('App', worker.tab.id).port.emit('passbolt.group.edit.add-user', groupUser);

        // Reset the autocomplete field.
        Worker.get('GroupEdit', worker.tab.id).port.emit('passbolt.group.edit.reset');
    });
};
exports.listen = listen;
