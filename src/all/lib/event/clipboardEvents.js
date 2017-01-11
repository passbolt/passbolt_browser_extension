/**
 * Clipboard events
 * @TODO flush clipboard event (on logout for example)
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var clipboardController = require('../controller/clipboardController');

var listen = function (worker) {

  /*
   * Copy to clipoard.
   *
   * @listens passbolt.clipboard.copy
   * @param txt {string} The string to copy to clipboard
   */
  worker.port.on('passbolt.clipboard.copy', function (txt) {
    clipboardController.copy(txt);
  });

};
exports.listen = listen;