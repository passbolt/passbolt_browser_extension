/**
 * File Listeners
 * Event related to file like open and save
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var fileController = require('../controller/fileController');

var listen = function (worker) {

  /*
   * Get the preferred download directory.
   *
   * @listens passbolt.keyring.generateKeyPair
   * @param requestId {int} The request identifier
   */
  worker.port.on('passbolt.file.getPreferredDownloadDirectory', function (requestId) {
    fileController.getPreferredDownloadsDirectory().then(
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
    fileController.openFile().then(
      function (fileContent) {
        worker.port.emit('passbolt.file.prompt.complete', requestId, 'SUCCESS', fileContent);
      },
      function (error) {
        worker.port.emit('passbolt.file.prompt.complete', requestId, 'ERROR', error);
      }
    );
  });
};
exports.listen = listen;