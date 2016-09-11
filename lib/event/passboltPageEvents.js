/**
 * Passbolt page Listeners
 *
 * Used for workers which require to perform operation on the passbolt page.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var Worker = require('../model/worker');

var listen = function (worker) {

  // Ask the passbolt page to release its focus.
  //
  // @listens passbolt.passbolt-page.remove_all_focuses
  // @fires passbolt.passbolt-page.remove_all_focuses on the App worker
  worker.port.on('passbolt.passbolt-page.remove_all_focuses', function () {
    Worker.get('App', worker.tab.id).port.emit('passbolt.passbolt-page.remove_all_focuses');
  });

};
exports.listen = listen;