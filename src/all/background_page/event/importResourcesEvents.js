/**
 * Import passwords Listeners
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import User from "../model/user";
import ImportResourcesFileController from "../controller/import/importResourcesFileController";


const listen = function(worker) {
  /*
   * Import resources file
   *
   * @listens passbolt.import-resources.import-file
   * @param requestId {uuid} The request identifier
   * @param fileType {string} The type of file. Support csv and kdbx
   * @param file {string} The file in base64
   * @returns {{references: {folder: (object|null), tag: (object|null)}, created: {resourcesCount: int, foldersCount: int}, options: {folders: boolean, tags: boolean}, errors: {folders: array, resources: array}}}
   */
  worker.port.on('passbolt.import-resources.import-file', async(requestId, fileType, file, options) => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const importController = new ImportResourcesFileController(worker, apiClientOptions);
    try {
      const importEntity = await importController.exec(fileType, file, options);
      worker.port.emit(requestId, 'SUCCESS', importEntity);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

export const ImportResourcesEvents = {listen};
