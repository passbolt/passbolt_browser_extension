/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.13.0
 */
import { OpenpgpAssertion } from "../../utils/openpgp/openpgpAssertions";
import EncryptMessageService from "../crypto/encryptMessageService";
import DecryptMessageService from "../crypto/decryptMessageService";
import SecretEntity from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity";
import GroupUpdateSecretsCollection from "../../model/entity/secret/groupUpdate/groupUpdateSecretsCollection";
import i18n from "../../sdk/i18n";

/**
 * Shared decrypt/encrypt logic for the "add users to group" flow.
 * It is called by both the MV2 path (GroupUpdateService, in the service worker / background page)
 * and the MV3 path (AddUsersToGroupOffscreenService, in the offscreen document) so the
 * cryptographic loop lives in a single place. The caller provides an `onProgress` callback to
 * decide how progress is surfaced (direct progress service update vs throttled offscreen message).
 */
class GroupUpdateSecretsCryptoService {
  /**
   * Decrypt a collection of secrets.
   * @param {openpgp.PrivateKey} privateKey The logged in user private key
   * @param {GroupUpdateSecretsCollection} secretsCollection The collection of secrets to decrypt
   * @param {function(string):void} [onProgress] Called after each secret with the progress message
   * @returns {Promise<object>} Decrypted secrets organized as {[resourceId]: secretDecrypted, ...}
   */
  static async decryptSecrets(privateKey, secretsCollection, onProgress) {
    const result = [];
    const collectionLength = secretsCollection.length;

    for (let i = 0; i < collectionLength; i++) {
      const secret = secretsCollection.items[i];
      const secretMessage = await OpenpgpAssertion.readMessageOrFail(secret.data);
      result[secret.resourceId] = await DecryptMessageService.decrypt(secretMessage, privateKey);

      await onProgress?.(i18n.t("Decrypting {{counter}}/{{total}}", { counter: i + 1, total: collectionLength }));
    }

    return result;
  }

  /**
   * Encrypt a collection of needed secrets.
   * @param {openpgp.PrivateKey} privateKey The logged in user private key
   * @param {object} usersPublicKeys The users public armored keys organized as {[userId]: armoredKey, ...}
   * @param {NeededSecretsCollection} neededSecretsCollection A collection of needed secret
   * @param {object} decryptedSecrets The decrypted secrets organized as {[resourceId]: secretDecrypted, ...}
   * @param {function(string):void} [onProgress] Called after each secret with the progress message
   * @returns {Promise<GroupUpdateSecretsCollection>}
   */
  static async encryptSecrets(privateKey, usersPublicKeys, neededSecretsCollection, decryptedSecrets, onProgress) {
    const groupUpdateSecrets = new GroupUpdateSecretsCollection([]);
    const collectionLength = neededSecretsCollection.length;

    for (let i = 0; i < collectionLength; i++) {
      const neededSecret = neededSecretsCollection.items[i];
      const user_id = neededSecret.userId;
      const resource_id = neededSecret.resourceId;

      const encryptionKey = await OpenpgpAssertion.readKeyOrFail(usersPublicKeys[user_id]);
      const data = await EncryptMessageService.encrypt(decryptedSecrets[resource_id], encryptionKey, [privateKey]);

      const secret = new SecretEntity({ resource_id, user_id, data });
      groupUpdateSecrets.push(secret);

      onProgress?.(i18n.t("Encrypting {{counter}}/{{total}}", { counter: i + 1, total: collectionLength }));
    }

    return groupUpdateSecrets;
  }
}

export default GroupUpdateSecretsCryptoService;
