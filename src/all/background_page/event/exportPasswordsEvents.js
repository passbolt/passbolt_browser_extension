/**
 * Export passwords Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var ExportPasswordsController = require('../controller/exportPasswordsController').ExportPasswordsController;
var Worker = require('../model/worker');
var TabStorage = require('../model/tabStorage').TabStorage;
var progressDialogController = require('../controller/progressDialogController');
var fileController = require('../controller/fileController');

var listen = function (worker) {

  /**
   * Get details of an export, like the number of passwords that will be exported.
   * This event is used by content code to display the number of passwords that will be exported.
   */
  worker.port.on('passbolt.export-passwords.get-details', function (requestId) {
    var exportedResources = TabStorage.get(worker.tab.id, 'exportedResources');
    var details = {
      count: exportedResources.length
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
    var resources = TabStorage.get(worker.tab.id, 'exportedResources');
    
    var exportPasswordsController = new ExportPasswordsController(worker.tab.id);
    exportPasswordsController.init(resources, options);
    exportPasswordsController.decryptSecrets()
    .then(function() {
      return exportPasswordsController.convertResourcesToFile();
    })
    .then(function(fileContent) {
      exportPasswordsController.downloadFile(fileContent);
    })
    .then(function() {
      // Display notification.
      var appWorker = Worker.get('App', worker.tab.id);
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