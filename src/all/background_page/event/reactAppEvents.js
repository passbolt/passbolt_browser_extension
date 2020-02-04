/**
 * React Application events.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const Worker = require('../model/worker');

const listen = function (worker) {
  /*
   * Hide the react app.
   *
   * @listens passbolt.app.hide
   */
  worker.port.on('passbolt.app.hide', function () {
    Worker.get('App', worker.tab.id).port.emit('passbolt.app.hide');
  });

  /*
   * Display a notification message.
   *
   * @listens passbolt.notification.display
   * @param notification {object} The notification to emit to the appjs
   *  - notification.status {string} The notification status: success, error or warning.
   *  - notification.message {string} The notification message.
   */
  worker.port.on('passbolt.notification.display', function (notification) {
    notification.force = true;
    Worker.get('App', worker.tab.id).port.emit('passbolt.notification.display', notification);
  });

  /*
   * Select and scroll to a resource.
   *
   * @listens passbolt.resources.select-and-scroll-to
   * @param {string} id The resource id.
   */
  worker.port.on('passbolt.resources.select-and-scroll-to', function (id) {
    Worker.get('App', worker.tab.id).port.emit('passbolt.resources.select-and-scroll-to', id);
  });

  /*
   * Select and scroll to a folder.
   *
   * @listens passbolt.folders.select-and-scroll-to
   * @param {string} id The folder id.
   */
  worker.port.on('passbolt.folders.select-and-scroll-to', function (id) {
    Worker.get('App', worker.tab.id).port.emit('passbolt.folders.select-and-scroll-to', id);
  });
};

exports.listen = listen;
