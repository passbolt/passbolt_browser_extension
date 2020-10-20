/**
 * Secret Listeners
 * Used for encryption and decryption events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {SecretDecryptController} = require('../controller/secret/secretDecryptController');
const {User} = require('../model/user');

const listen = function (worker) {
  /*
   * Decrypt a given armored string.
   *
   * @listens passbolt.secret.decrypt
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.secret.decrypt', async function (requestId, resourceId) {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const controller = new SecretDecryptController(worker, requestId, apiClientOptions);
      const {plaintext} = await controller.main(resourceId);
      worker.port.emit(requestId, 'SUCCESS', plaintext);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

exports.listen = listen;
