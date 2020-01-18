/**
 * Folder events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {FolderEntity} = require('../model/entity/folder/folderEntity');
const {FolderModel} = require('../model/folderModel');
const {User} = require('../model/user');
const {CsrfToken} = require('../utils/csrfToken/csrfToken');
const Worker = require('../model/worker');

const listen = function (worker) {

  /*
   * Open the folder create dialog.
   *
   * @listens passbolt.folders.open-create-dialog
   * @param requestId {uuid} The request identifier
   * @param folder {object} The folder meta data
   * @param password {string} The password to encrypt
   */
  worker.port.on('passbolt.folders.open-create-dialog', async function () {
    const reactAppWorker = Worker.get('ReactApp', worker.tab.id);
    reactAppWorker.port.emit('passbolt.folders.open-create-dialog');
  });

  /*
   * Save a folder
   *
   * @listens passbolt.folders.create
   * @param requestId {uuid} The request identifier
   * @param folder {array} The folder
   */
  worker.port.on('passbolt.folders.create', async function (requestId, folderDto) {
    try {
      let folderModel = new FolderModel(await User.getInstance().getApiClientOptions());
      let folderEntity = new FolderEntity(folderDto);
      folderEntity = await folderModel.create(folderEntity);
      worker.port.emit(requestId, 'SUCCESS', folderEntity);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
    }
  });
};

exports.listen = listen;
