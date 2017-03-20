/**
 * Group Listeners
 *
 * Used for handling groups / group edits
 *
 * @copyright (c) 2017-present Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var Worker = require('../model/worker');
var User = require('../model/user').User;
var Group = require('../model/group').Group;
var TabStorage = require('../model/tabStorage').TabStorage;

var listen = function (worker) {
    /*
     * Search users that could be added to a group.
     * Once the search has been completed, send the users to the autocomplete
     * worker.
     *
     * @listens passbolt.group.search-users
     * @param keywords {string} The keywords to search
     */
    worker.port.on('passbolt.group.edit.search-users', function (keywords) {
        var //sharedPassword = TabStorage.get(worker.tab.id, 'sharedPassword'),
            user = new User(),
            autocompleteWorker = Worker.get('GroupEditAutocomplete', worker.tab.id),
            // The users that have already been added to the share list should be
            // excluded from the search.
            groupUsers = TabStorage.get(worker.tab.id, 'groupUsers'),
            excludedUsers = [];

        // If no keywords provided, hide the autocomplete component.
        if (!keywords) {
            autocompleteWorker.port.emit('passbolt.group.edit-autocomplete.reset');
        }
        // Otherwise, search the users who match the keywords,
        // and display them in the autocomplete component.
        else {
            autocompleteWorker.port.emit('passbolt.group.edit-autocomplete.loading');

            // Build array of excluded users.
            for (var i in groupUsers) {
                excludedUsers.push(groupUsers[i].user_id);
            }

            // Search available users.
            user.searchUsers(keywords, excludedUsers)
                .then(function(users) {
                    autocompleteWorker.port.emit('passbolt.group.edit-autocomplete.load-users', users);
                }, function(e) {
                    console.error(e);
                });
        }
    });

    /*
     * Save a group.
     * Receives the instruction from the app that the group is ready to be saved.
     * The plugin already knows the list of groupUsers.
     *
     * @listens passbolt.group.edit.save
     * @param group {string} The group object, containing mainly the name of the group. We already know the
     * list of groupUsers.
     */
    worker.port.on('passbolt.group.edit.save', function (group) {
        // Make request to server.
        var groupUsers = TabStorage.get(worker.tab.id, 'groupUsers'),
            groupName = group.name;

        var groupJson = {
            "Group" : {
                name: groupName,
            },
            "GroupUsers": []
        };

        for (var i in groupUsers) {
            var groupUser = {
                "user_id": groupUsers[i].user_id,
                "is_admin": groupUsers[i].is_admin,
            };
            groupJson.GroupUsers.push({ "GroupUser" : groupUser });
        }

        var group = new Group();
        group.save(groupJson)
            .then(
                function success(group) {
                    var appWorker = Worker.get('App', worker.tab.id);
                    appWorker.port.emit('passbolt.group.edit.save.success', group);
                },
                function error(errorResponse) {
                    var appWorker = Worker.get('App', worker.tab.id);
                    appWorker.port.emit('passbolt.group.edit.save.error', errorResponse);
                }
            );

    });
};
exports.listen = listen;