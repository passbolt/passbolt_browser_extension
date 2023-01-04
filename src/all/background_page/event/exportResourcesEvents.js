/**
 * Export passwords Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import User from "../model/user";
import ExportResourcesFileController from "../controller/export/exportResourcesFileController";


const listen = function(worker) {
  /*
   * Export resources to file
   *
   * @listens passbolt.export-resources.export-to-file
   * port-resources.export-to-file
   * @param requestId {uuid} The request identifier
   * @param exportResourcesFileDto {object} The export resources file DTO
   */
  worker.port.on('passbolt.export-resources.export-to-file', async(requestId, exportResourcesFileDto) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const exportController = new ExportResourcesFileController(worker, apiClientOptions);
    try {
      await exportController.exec(exportResourcesFileDto);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

export const ExportResourcesEvents = {listen};
