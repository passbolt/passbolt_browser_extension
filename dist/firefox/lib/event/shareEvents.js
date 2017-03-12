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
          var excludedAros = TabStorage.get(worker.tab.id, 'shareWith');
          for(var i in excludedAros) {
            var excludedAroId = excludedAros[i].User ? excludedAros[i].User.id : excludedAros[i].Group.id;
            for(var j in aros) {
              var aroId = aros[j].User ? aros[j].User.id : aros[j].Group.id;
              if(aroId == excludedAroId) {
                aros.splice(j, 1);
              }
            }
          }
          autocompleteWorker.port.emit('passbolt.share-autocomplete.load-users', aros);
        }, function (e) {
          // @todo ERROR case not managed
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
