/**
 * Secret Listeners
 * Used for encryption and decryption events
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import FindSecretByResourceIdController from "../controller/secret/findSecretByResourceIdController";

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
   * @listens passbolt.secret.find-by-resource-id
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.secret.find-by-resource-id', async(requestId, resourceId) => {
    const controller = new FindSecretByResourceIdController(worker, requestId, apiClientOptions, account);
    await controller._exec(resourceId);
  });
};

export const SecretEvents = {listen};
