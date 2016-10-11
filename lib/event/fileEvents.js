/**
 * File Listeners
 * Event related to file like open and save
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var fileIO = require('sdk/io/file');
var filepickerController = require('../controller/filepickerController');
const {Cu} = require('chrome');

var listen = function (worker) {

    // Listen to get preferred Download directory.
    worker.port.on('passbolt.file.getPreferredDownloadDirectory', function (token) {
        Cu.import("resource://gre/modules/Downloads.jsm");
        Downloads.getPreferredDownloadsDirectory().then(
            function(downloadsDirectory) {
                worker.port.emit('passbolt.file.getPreferredDownloadDirectory.complete', token, 'SUCCESS', downloadsDirectory);
            },
            function(error) {
                worker.port.emit('passbolt.file.getPreferredDownloadDirectory.complete', token, 'ERROR', error);
            }
        );
    });

    // Listen to request to prompt a file.
    worker.port.on('passbolt.file.prompt', function (token) {
        var path = filepickerController.openFilePrompt();
        if (fileIO.isFile(path)) {
            var fileContent = fileIO.read(path);
            worker.port.emit('passbolt.file.prompt.complete', token, 'SUCCESS', fileContent);
        }
    });
};
exports.listen = listen;