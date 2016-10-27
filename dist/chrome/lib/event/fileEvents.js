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

  /*
   * Get the preferred download directory.
   *
   * @listens passbolt.keyring.generateKeyPair
   * @param requestId {int} The request identifier
   */
  worker.port.on('passbolt.file.getPreferredDownloadDirectory', function (requestId) {
    Cu.import("resource://gre/modules/Downloads.jsm");
    Downloads.getPreferredDownloadsDirectory().then(
      function (downloadsDirectory) {
        worker.port.emit('passbolt.file.getPreferredDownloadDirectory.complete', requestId, 'SUCCESS', downloadsDirectory);
      },
      function (error) {
        worker.port.emit('passbolt.file.getPreferredDownloadDirectory.complete', requestId, 'ERROR', error);
      }
    );
  });

  /*
   * Prompt a file.
   *
   * @listens passbolt.keyring.generateKeyPair
   * @param requestId {int} The request identifier
   */
  worker.port.on('passbolt.file.prompt', function (requestId) {
    var path = filepickerController.openFilePrompt();
    if (fileIO.isFile(path)) {
      var fileContent = fileIO.read(path);
      worker.port.emit('passbolt.file.prompt.complete', requestId, 'SUCCESS', fileContent);
    }
  });

};
exports.listen = listen;