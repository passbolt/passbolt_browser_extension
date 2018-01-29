/**
 * Import passwords Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var ImportController = require('../controller/importController').ImportController;


var listen = function (worker) {

  worker.port.on('passbolt.import-passwords.import-kdbx', function (requestId, b64FileContent, credentials) {
    var importController = new ImportController(worker.tab.id);

      importController.initFromKdbx(b64FileContent, credentials)
      .then(function(resources) {
        return importController.encryptSecrets(resources);
      })
      .then(function (resources) {
        return importController.saveResources(resources);
      })
      .then(function(values) {
        console.log(values);
        worker.port.emit(requestId, 'SUCCESS');
      })
      .catch(function(e) {
        console.log('error', e);
        worker.port.emit(requestId, 'ERROR', e);
      });
  });
};

exports.listen = listen;