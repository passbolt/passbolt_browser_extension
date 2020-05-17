/**
 * Export passwords Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const ExportPasswordsController = require('../controller/exportPasswordsController').ExportPasswordsController;
const Worker = require('../model/worker');
const TabStorage = require('../model/tabStorage').TabStorage;

const listen = function (worker) {

  /**
   * Get details of an export, like the number of passwords that will be exported.
   * This event is used by content code to display the number of passwords that will be exported.
   */
  worker.port.on('passbolt.export-passwords.get-details', function (requestId) {
    const itemsToExport = TabStorage.get(worker.tab.id, 'itemsToExport');
    const details = {
      count: itemsToExport.resources.length
    };
    worker.port.emit(requestId, 'SUCCESS', details);
  });

  /**
   * Export resources into a file, according to options parameters.
   * @param requestId the requestId
   * @param options (refer to exportPasswordsController).
   *   format
   *   credentials
   */
  worker.port.on('passbolt.export-passwords.export-to-file', function (requestId, options) {
    const itemsToExport = TabStorage.get(worker.tab.id, 'itemsToExport');

    const exportPasswordsController = new ExportPasswordsController(worker);
    exportPasswordsController.init(itemsToExport, options);
    exportPasswordsController.decryptSecrets()
    .then(function() {
      return exportPasswordsController.convertResourcesToFile();
    })
    .then(function(fileContent) {
      return exportPasswordsController.downloadFile(fileContent);
    })
    .then(function() {
      // Display notification.
      const appWorker = Worker.get('App', worker.tab.id);
      appWorker.port.emit('passbolt.export-passwords.complete');

      worker.port.emit(requestId, 'SUCCESS');
    })
    .catch(function(e) {
      console.error("Export error:", e);
      worker.port.emit(requestId, 'ERROR', e);
    });
  });
};

exports.listen = listen;
