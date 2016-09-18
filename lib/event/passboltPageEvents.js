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

  // Ask the passbolt page to add a css class to an HTML Element.
  //
  // @listens passbolt.passbolt-page.add-class
  // @param selector {string} The HTML Element selector
  // @param cssClass {string} The class(es) to add to the html element
  //
  // @fires passbolt.passbolt-page.add-class on the App worker
  worker.port.on('passbolt.passbolt-page.add-class', function (selector, cssClass) {
    Worker.get('App', worker.tab.id).port.emit('passbolt.passbolt-page.add-class', selector, cssClass);
  });

  // Ask the passbolt page to remove a css class from an HTML Element.
  //
  // @listens passbolt.passbolt-page.remove-class
  // @param selector {string} The HTML Element selector
  // @param cssClass {string} The class(es) to remove from the html element
  //
  // @fires passbolt.passbolt-page.remove-class on the App worker
  worker.port.on('passbolt.passbolt-page.remove-class', function (selector, cssClass) {
    Worker.get('App', worker.tab.id).port.emit('passbolt.passbolt-page.remove-class', selector, cssClass);
  });

};
exports.listen = listen;