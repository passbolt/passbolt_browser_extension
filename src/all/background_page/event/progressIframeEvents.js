/**
 * Progress iframe events.
 *
 * It has for aim to control the the progress iframe.
 *  - Add the iframe to the application page. the progressDialogPagemod
 *    will detect it and will display the iframe content.
 *  - Close the iframe.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Worker = require('../model/worker');

var listen = function (worker) {

  /*
   * Open the progress dialog.
   *
   * @listens passbolt.progress.open-dialog
   * @param requestId {uuid} The request identifier
   * @param title {string} Title of the dialog
   * @param goals {int} The number of goals to complete
   */
  worker.port.on('passbolt.progress.open-dialog', function (requestId, title, goals) {
    console.log('Progress Iframe Event passbolt.progress.open-dialog received');
    Worker.get('App', worker.tab.id).port.emit(requestId, title, goals);
    // When the dialog is opened, answer to the request caller.
    Worker.get('App', worker.tab.id).port.once('passbolt.progress.open-dialog.complete', function () {
      worker.port.emit(requestId, 'SUCCESS');
    });
  });

  /*
   * Close the progress dialog.
   *
   * @listens passbolt.progress.close-dialog
   */
  worker.port.on('passbolt.progress.close-dialog', function () {
    Worker.get('App', worker.tab.id).port.emit('passbolt.progress.close-dialog');
  });

};
exports.listen = listen;
