/**
 * Secret Listeners
 * Used for encryption and decryption events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import User from "../model/user";
import SecretDecryptController from "../controller/secret/secretDecryptController";

const listen = function(worker) {
  /*
   * Decrypt a given armored string.
   *
   * @listens passbolt.secret.decrypt
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.secret.decrypt', async(requestId, resourceId, options) => {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      let showProgress = true;
      if (options && Object.prototype.hasOwnProperty.call(options, 'showProgress')) {
        showProgress = options.showProgress;
      }
      const controller = new SecretDecryptController(worker, requestId, apiClientOptions);
      const {plaintext} = await controller.main(resourceId, showProgress);
      worker.port.emit(requestId, 'SUCCESS', plaintext);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

export const SecretEvents = {listen};
