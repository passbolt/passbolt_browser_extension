/**
 * Export passwords Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {ExportResourcesFileController} = require('../controller/export/exportResourcesFileController')
const {User} = require('../model/user');

const listen = async function (worker) {

  // @todo remove @debug
  const exportDto = {
    // "format": "csv-kdbx",
    "format": "kdbx",
    "folders_ids": [
    "b0634391-e66e-4880-8e69-4a5b7ea39237",
    "f9470535-d83d-4e38-9453-740758418080",
    "e098370e-43a4-442d-9472-207150673b5d",
    "5f78da64-34bd-45d9-8418-a064a45ff150"
  ],
    "resources_ids": [
    "34d3ffde-ab33-45fe-b408-20c4b33719d7",
    "7d22de06-875e-4c58-bb0a-cb5488a86a8e",
    "ed860b9a-35bf-463b-b74c-dce8f0018c62"
  ]};

  const apiClientOptions = await User.getInstance().getApiClientOptions();
  const exportController = new ExportResourcesFileController(worker, apiClientOptions);
  // await exportController.exec(exportDto);

  /*
   * Export resources tp file
   *
   * @listens passbolt.ex
   * port-resources.export-to-file
   * @param requestId {uuid} The request identifier
   * @param exportResourcesFileDto {object} The export resources file DTO
   */
  worker.port.on('passbolt.export-resources.export-to-file', async function (requestId, exportResourcesFileDto) {
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

exports.listen = listen;
