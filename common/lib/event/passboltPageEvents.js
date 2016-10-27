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

  /*
   * Notify the passbolt page that a process is currently running on the plugin.
   * When the process is completed, the event
   * passbolt.passbolt-page.loading_complete should be fired.
   *
   * @listens passbolt.passbolt-page.loading
   */
  worker.port.on('passbolt.passbolt-page.loading', function () {
    Worker.get('App', worker.tab.id).port.emit('passbolt.passbolt-page.loading');
  });

  /*
   * Notify the passbolt page that a process has been completed on the plugin.
   *
   * @listens passbolt.passbolt-page.loading_complete
   */
  worker.port.on('passbolt.passbolt-page.loading_complete', function () {
    Worker.get('App', worker.tab.id).port.emit('passbolt.passbolt-page.loading_complete');
  });

  /*
   * Ask the passbolt page to release its focus.
   *
   * @listens passbolt.passbolt-page.remove-all-focuses
   */
  worker.port.on('passbolt.passbolt-page.remove-all-focuses', function () {
    Worker.get('App', worker.tab.id).port.emit('passbolt.passbolt-page.remove-all-focuses');
  });

  /*
   * Ask the passbolt page to add a css class to an HTML Element.
   *
   * @listens passbolt.passbolt-page.add-class
   * @param selector {string} The HTML Element selector
   * @param cssClass {string} The class(es) to add to the html element
   */
  worker.port.on('passbolt.passbolt-page.add-class', function (selector, cssClass) {
    Worker.get('App', worker.tab.id).port.emit('passbolt.passbolt-page.add-class', selector, cssClass);
  });

  /*
   * Ask the passbolt page to remove a css class from an HTML Element.
   *
   * @listens passbolt.passbolt-page.remove-class
   * @param selector {string} The HTML Element selector
   * @param cssClass {string} The class(es) to remove from the html element
   */
  worker.port.on('passbolt.passbolt-page.remove-class', function (selector, cssClass) {
    Worker.get('App', worker.tab.id).port.emit('passbolt.passbolt-page.remove-class', selector, cssClass);
  });

  /*
   * Ask the passbolt page to resize an iframe.
   *
   * @listens passbolt.passbolt-page.resize-iframe
   * @param selector {string} The iframe HTML Element selector
   * @param dimension {object} The new iframe dimension
   */
  worker.port.on('passbolt.passbolt-page.resize-iframe', function (selector, dimension) {
    Worker.get('App', worker.tab.id).port.emit('passbolt.passbolt-page.resize-iframe', selector, dimension);
  });

};
exports.listen = listen;