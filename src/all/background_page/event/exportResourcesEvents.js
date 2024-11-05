/**
 * Export passwords Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import ExportResourcesFileController from "../controller/export/exportResourcesFileController";

/**
 * Listens to the export resources events
 * @param {Worker} worker The worker
 * @param {ApiClientOptions} apiClientOptions The api client options
 * @param {AccountEntity} account The account
 */
const listen = function(worker, apiClientOptions, account) {
  /*
   * Export resources to file
   *
   * @listens passbolt.export-resources.export-to-file
   * port-resources.export-to-file
   * @param requestId {uuid} The request identifier
   * @param exportResourcesFileDto {object} The export resources file DTO
   */
  worker.port.on('passbolt.export-resources.export-to-file', async(requestId, exportResourcesFileDto) => {
    const controller = new ExportResourcesFileController(worker, requestId, apiClientOptions, account);
    await controller._exec(exportResourcesFileDto);
  });
};

export const ExportResourcesEvents = {listen};
