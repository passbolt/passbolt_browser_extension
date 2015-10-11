/**
 * Clipboard events
 * @TODO flush clipboard event (on logout for example)
 */
var clipboardController = require('../controller/clipboardController');

var listen = function (worker) {
    // Listen to copy to clipboard event.
    worker.port.on('passbolt.clipboard.copy', function(txt) {
        clipboardController.copy(worker, txt);
    });
};
exports.listen = listen;