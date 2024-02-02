/**
 * Secret Listeners
 * Used for encryption and decryption events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import SecretDecryptController from "../controller/secret/secretDecryptController";
import PownedPasswordController from '../controller/secret/pownedPasswordController';

/**
 * Listens the secret events
 * @param {Worker} worker
 * @param {ApiClientOptions} apiClientOptions the api client options
 * @param {AccountEntity} account the user account
 */
const listen = function(worker, apiClientOptions, account) {
  /*
   * Decrypt a given armored string.
   *
   * @listens passbolt.secret.decrypt
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.secret.decrypt', async(requestId, resourceId) => {
    const controller = new SecretDecryptController(worker, requestId, apiClientOptions, account);
    await controller._exec(resourceId);
  });

  /*
   * Check if password is powned
   *
   * @listens passbolt.secrets.powned-password
   * @param requestId {uuid} The request identifier
   * @param password {string} the password to check
   */
  worker.port.on('passbolt.secrets.powned-password', async(requestId, password) => {
    const controller = new PownedPasswordController(worker, requestId);
    await controller._exec(password);
  });
};

export const SecretEvents = {listen};
