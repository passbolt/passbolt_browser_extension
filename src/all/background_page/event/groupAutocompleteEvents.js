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
var GroupForm = require('../model/groupForm').GroupForm;

var listen = function (worker) {
    /*
     * A user has been selected to share the secret with.
     *
     * @listens passbolt.share-autocomplete.user-selected
     * @param user {array} The selected user
     */
    worker.port.on('passbolt.group.edit-autocomplete.user-selected', function (user) {
        var groupForm = new GroupForm(worker.tab.id);

        groupForm.addGroupUser(user)
            .then(function(groupUser) {
                // Add user in the list of group users.
                Worker.get('App', worker.tab.id).port.emit('passbolt.group.edit.add-user', groupUser);
            });

        // Reset the autocomplete field.
        Worker.get('GroupEdit', worker.tab.id).port.emit('passbolt.group.edit.reset');
    });
};
exports.listen = listen;
