/**
 * Share Listeners
 *
 * Used for sharing passwords
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var Worker = require('../model/worker');
var TabStorage = require('../model/tabStorage').TabStorage;
var Permission = require('../model/permission').Permission;

var listen = function (worker) {

  /*
   * Search users relative to the keywords given as parameter.
   * Once the search has been completed, send the users to the autocomplete
   * worker.
   *
   * @listens passbolt.share.search-users
   * @param keywords {string} The keywords to search
   */
  worker.port.on('passbolt.share.search-users', function (keywords) {
    var sharedPassword = TabStorage.get(worker.tab.id, 'sharedPassword'),
      permission = new Permission(),
      autocompleteWorker = Worker.get('ShareAutocomplete', worker.tab.id),
    // The users that have already been added to the share list should be
    // excluded from the search.
      excludedUsers = TabStorage.get(worker.tab.id, 'shareWith');

    autocompleteWorker.port.emit('passbolt.share-autocomplete.loading');

    permission.searchUsers('resource', sharedPassword.resourceId, keywords, excludedUsers)
      .then(function (users) {
        autocompleteWorker.port.emit('passbolt.share-autocomplete.load-users', users);
      }, function (e) {
        // @todo ERROR case not managed
      });
  });

  /*
   * Get the shared password.
   *
   * @listens passbolt.share.get-shared-password
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.share.get-shared-password', function (requestId) {
    var sharedPassword = TabStorage.get(worker.tab.id, 'sharedPassword');
    worker.port.emit(requestId, 'SUCCESS', sharedPassword);
  });

};
exports.listen = listen;
