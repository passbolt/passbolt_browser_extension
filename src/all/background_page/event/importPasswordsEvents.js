/**
 * Import passwords Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var ImportController = require('../controller/importPasswordsController').ImportPasswordsController;
var Worker = require('../model/worker');

var listen = function (worker) {

  worker.port.on('passbolt.import-passwords.import-file', function (requestId, b64FileContent, fileType, options) {
    var importController = new ImportController(worker.tab.id);

    var loader = null;
    if (fileType == 'kdbx') {
      loader = importController.initFromKdbx(b64FileContent, options.credentials);
    } else if( fileType == 'csv') {
      loader = importController.initFromCsv(b64FileContent, {});
    }

    loader
    .then(function(resources) {
      return importController.encryptSecrets(resources);
    })
    .then(function (resources) {
      return importController.saveResources(resources);
    })
    .then(function(responses) {
      // Inform the app-js that the import is complete.
      var appWorker = Worker.get('App', worker.tab.id);
      appWorker.port.emit('passbolt.import-passwords.complete');

      // Send results report to content code, in order to display report.
      const result = {
        "resources": importController.resources,
        "responses": responses
      };
      worker.port.emit(requestId, 'SUCCESS', result);
    })
    .catch(function(e) {
      console.error(e);
      worker.port.emit(requestId, 'ERROR', e);
    });
  });
};

exports.listen = listen;