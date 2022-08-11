/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SARL (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.4.0
 */
import {OpenpgpAssertion} from "../utils/openpgp/openpgpAssertions";
import Keyring from "../model/keyring";
import EncryptMessageService from "../service/crypto/encryptMessageService";
import DecryptMessageService from "../service/crypto/decryptMessageService";
import ShareService from "../service/share";

class Share {}

/**
 * Search aros to share resources with.
 * @param {string} keywords The string to search
 * @return {array}
 */
Share.searchAros = async function(keywords) {
  return ShareService.searchAros(keywords);
};

/**
 * Search users that could be granted to access a given resource.
 *
 * @param resourceId {string} The resource to search for
 * @param keywords {string} The string to search
 * @deprecated since v2.4.0 will be removed in v3.0
 * replaced by the Share.searchAros
 * @returns {array}
 */
Share.searchResourceAros = function(resourceId, keywords) {
  return ShareService.searchResourceAros(resourceId, keywords);
};

/**
 * Bulk share multiple resources.
 * @param {array} resources The resources to share
 * @param {array} changes The permissions changes to apply
 * @param {openpgp.PrivateKey} privateKey The decrypted private key to use to decrypt the message.
 * @param {function} progressCallback Notify the user with this callback
 */
Share.bulkShareResources = async function(resources, changes, privateKey, progressCallback) {
  const resourcesChanges = bulkShareAggregateChanges(resources, changes);
  const resourcesNewUsers = await bulkShareSimulate(resources, resourcesChanges, progressCallback);
  const resourcesSecrets = await bulkShareEncrypt(resources, resourcesNewUsers, privateKey, progressCallback);
  for (const resourceId in resourcesChanges) {
    if (Object.prototype.hasOwnProperty.call(resourcesChanges, resourceId)) {
      const resource = resources.find(resource => resource.id === resourceId);
      const permissions = resourcesChanges[resourceId];
      const secrets = resourcesSecrets[resourceId] || [];
      progressCallback(`Sharing password ${resource.name}`);
      await ShareService.shareResource(resourceId, {permissions: permissions, secrets: secrets});
    }
  }
};

/**
 * Bulk share multiple resources.
 * @param {FoldersCollection} foldersCollection
 * @param {PermissionChangesCollection} changesCollection
 * @param {FolderModel} folderModel
 * @param {function} progressCallback Notify the user with this callback
 */
Share.bulkShareFolders = async function(foldersCollection, changesCollection, folderModel, progressCallback) {
  for (const folderEntity of foldersCollection) {
    const permissions = changesCollection.filterByAcoForeignKey(folderEntity.id);
    if (permissions && permissions.length) {
      await progressCallback(`Updating folder ${folderEntity.name} permissions`);
      await folderModel.share(folderEntity, permissions, false);
    }
  }
  await folderModel.updateLocalStorage();
};

/**
 * Aggregate the changes by Acos.
 * @param {array} acos The resources to share
 * @param {array} changes The changes to apply
 * @return {object}
 */
const bulkShareAggregateChanges = function(acos, changes) {
  if (!acos || !Array.isArray(acos) || !acos.length) {
    throw new TypeError('bulkShareAggregateChanges expect an array of ACOs');
  }
  if (!changes || !Array.isArray(changes) || !changes.length) {
    throw new TypeError('bulkShareAggregateChanges expect an array of changes');
  }

  const acosChanges = {};
  acos.forEach(aco => {
    const acoChanges = changes.filter(change => change.aco_foreign_key === aco.id);
    if (acoChanges.length) {
      acosChanges[aco.id] = acoChanges;
    }
  });

  return acosChanges;
};

/**
 * Simulate the changes to apply to the resources
 * @param {array} resources
 * @param {object} resourcesChanges The changes aggregated by resource
 * @param {function} progressCallback Notify the user with this callback
 * @returns {object}
 */
const bulkShareSimulate = async function(resources, resourcesChanges, progressCallback) {
  const usersToEncryptFor = {};

  for (const resourceId in resourcesChanges) {
    const resource = resources.find(resource => resource.id === resourceId);
    progressCallback(`Validating share operation for ${resource.name}`);
    const simulateResult = await ShareService.simulateShareResource(resourceId, resourcesChanges[resourceId]);
    const simulateAddedUsers = simulateResult.changes.added;
    if (simulateAddedUsers.length) {
      usersToEncryptFor[resourceId] = simulateAddedUsers.reduce((carry, user) => [...carry, user.User.id], []);
    }
  }

  return usersToEncryptFor;
};

/**
 * Encrypt the resources secrets for all the new users
 * @param {array} resources The resources to share
 * @param {object} resourcesNewUsers The list of new users to share the resources aggregated by resource
 * @param {openpgp.PrivateKey} privateKey The decrypted private key to use to decrypt the message.
 * @param {function} progressCallback Notify the user with this callback
 * @returns {object} A list of secrets as expected by the passbolt API
 * [
 *  {
 *    resource_id: UUID,
 *    user_id: UUID,
 *    data: string
 *  }
 * ]
 */
const bulkShareEncrypt = async function(resources, resourcesNewUsers, privateKey, progressCallback) {
  const keyring = new Keyring();
  const secrets = {};

  for (const resourceId in resourcesNewUsers) {
    const resource = resources.find(resource => resource.id === resourceId);
    const originalMessage = await OpenpgpAssertion.readMessageOrFail(resource.secrets[0].data);
    const users = resourcesNewUsers[resourceId];
    progressCallback(`Encrypting for ${resource.name}`);
    if (users && users.length) {
      const message = await DecryptMessageService.decrypt(originalMessage, privateKey);
      const encryptAllData = users.reduce((carry, userId) => [...carry, {userId: userId, message: message}], []);

      const result = [];
      for (const i in encryptAllData) {
        const data = encryptAllData[i];
        const userPublicArmoredKey = keyring.findPublic(data.userId).armoredKey;
        const userPublicKey = await OpenpgpAssertion.readKeyOrFail(userPublicArmoredKey);
        const messageEncrypted = await EncryptMessageService.encrypt(data.message, userPublicKey, [privateKey]);
        result.push({
          resource_id: resourceId,
          user_id: data.userId,
          data: messageEncrypted
        });
      }

      secrets[resourceId] = result;
    }
  }

  return secrets;
};

export default Share;
