/**
 * Share Listeners
 *
 * Used for sharing passwords
 *
 * @copyright (c) 2017 Passbolt SARL
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
      autocompleteWorker = Worker.get('ShareAutocomplete', worker.tab.id);

    // If no keywords provided, hide the autocomplete component.
    if (!keywords) {
      autocompleteWorker.port.emit('passbolt.share-autocomplete.reset');
    }
    // Otherwise, search the users who match the keywords,
    // and display them in the autocomplete component.
    else {
      autocompleteWorker.port.emit('passbolt.share-autocomplete.loading');
      permission.searchUsers('resource', sharedPassword.resourceId, keywords)
        .then(function (aros) {
          // The users & groups that have already been added to the share list should not be displayed.
          var excludedAros = TabStorage.get(worker.tab.id, 'shareWith'),
              excludedArosIds = [];
          // Extract the excluded aros ids.
          if (excludedAros) {
            excludedArosIds = excludedAros.map(function(excludedAro) {
              return excludedAro.User ? excludedAro.User.id : excludedAro.Group.id;
            });
          }

          // Filter the data returned by the API.
          aros = aros.filter(function(aro) {
            var aroId = aro.User ? aro.User.id : aro.Group.id;
            return excludedArosIds.indexOf(aroId) === -1;
          });

          // Load the aros in the autocomplete list.
          autocompleteWorker.port.emit('passbolt.share-autocomplete.load-users', aros);
        }, function (error) {
          autocompleteWorker.port.emit('passbolt.share-autocomplete.load-users', []);
        });
    }
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
