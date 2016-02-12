/**
 * Clipboard events
 * @TODO flush clipboard event (on logout for example)
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var clipboardController = require('../controller/clipboardController');

var listen = function (worker) {
    // Listen to copy to clipboard event.
    worker.port.on('passbolt.clipboard.copy', function(txt) {
        clipboardController.copy(worker, txt);
    });
};
exports.listen = listen;