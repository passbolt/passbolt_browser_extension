/**
 * Export passwords Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const ExportController = require('../controller/export/exportController').ExportController;

const listen = function (worker) {
  /**
   * Export resources into a file, according to options parameters.
   * @param requestId the requestId
   * @param itemsToExport The items to export {foldersIds: [folder1Id, ...], resourcesIds: [resource1Id, ...]}
   * @param options (refer to exportPasswordsController).
   *   format
   *   credentials
   */
  worker.port.on('passbolt.export-passwords.export-to-file', async function (requestId, itemsToExport, options) {
    const exportController = new ExportController(worker, itemsToExport, options);
    try {
      await exportController.exec();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

exports.listen = listen;
