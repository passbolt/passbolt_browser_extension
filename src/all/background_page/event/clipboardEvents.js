/**
 * Clipboard events
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const Worker = require('../model/worker');

const listen = function(worker) {
  /*
   * Copy to clipoard.
   *
   * @listens passbolt.clipboard.copy
   * @param txt {string} The string to copy to clipboard
   */
  worker.port.on('passbolt.clipboard.copy', (requestId, txt) => {
    const clipboardWorker = Worker.get('ClipboardIframe', worker.tab.id);
    clipboardWorker.port.emit('passbolt.clipboard-iframe.copy', txt);
    worker.port.emit(requestId, 'SUCCESS');
  });
};
exports.listen = listen;
