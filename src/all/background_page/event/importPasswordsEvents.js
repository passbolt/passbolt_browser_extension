/**
 * Import passwords Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const ImportController = require('../controller/importPasswordsController').ImportPasswordsController;
const Worker = require('../model/worker');

const listen = function (worker) {

  worker.port.on('passbolt.import-passwords.import-file', function (requestId, b64FileContent, fileType, options) {
    const importController = new ImportController(worker);

    let loader = null;
    if (fileType === 'kdbx') {
      loader = importController.initFromKdbx(b64FileContent, options.credentials);
    } else if( fileType === 'csv') {
      loader = importController.initFromCsv(b64FileContent, {});
    }

    loader
    .then(function(resources) {
      return importController.encryptSecrets(resources);
    })
    .then(function (resources) {
      options.importTag = ImportController._generateUniqueImportTag(fileType);
      return importController.saveResources(resources, options);
    })
    .then(function(responses) {
      // Send results report to content code, in order to display report.
      const result = {
        "resources": responses.resources,
        "folders": responses.folders,
        "importTag": options.importTag
      };

      // Inform the app-js that the import is complete.
      const appWorker = Worker.get('App', worker.tab.id);
      appWorker.port.emit('passbolt.import-passwords.complete', result);

      worker.port.emit(requestId, 'SUCCESS', result);
    })
    .catch(function(e) {
      console.error(e);
      worker.port.emit(requestId, 'ERROR', e);
    });
  });
};

exports.listen = listen;
