/**
 * Import passwords Listeners
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const ImportController = require('../controller/import/importController').ImportController;
const User = require('../model/user').User;

const listen = function (worker) {
  worker.port.on('passbolt.import-passwords.import-file', async function (requestId, b64FileContent, fileType, options) {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const importController = new ImportController(worker, apiClientOptions, options, fileType, b64FileContent);
    try {
      const result = await importController.exec();
      worker.port.emit(requestId, 'SUCCESS', result);
    } catch (e) {
      console.error(e);
      worker.port.emit(requestId, 'ERROR', e);
    }
  });
};

exports.listen = listen;
