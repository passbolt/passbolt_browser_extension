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
 * @since         5.1.1
 */

import RoleEntity from "passbolt-styleguide/src/shared/models/entity/role/roleEntity";
import UserModel from "../../model/user/userModel";
import {assertString, assertUuid} from "../../utils/assertions";
import MetadataPrivateKeyApiService from "../api/metadata/metadataPrivateKeyApiService";
import ShareMetadataPrivateKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/shareMetadataPrivateKeysCollection";
import GetOrFindMetadataKeysService from "./getOrFindMetadataKeysService";
import EncryptMetadataPrivateKeysService from "./encryptMetadataPrivateKeysService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import Keyring from "../../model/keyring";
import UserLocalStorage from "../local_storage/userLocalStorage";
import FindUsersService from "../user/findUsersService";

/**
 * The service aims to share metadata private keys with an user.
 */
export default class ShareMetadataKeyPrivateService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.userModel = new UserModel(apiClientOptions);
    this.keyring = new Keyring();
    this.metadataPrivateKeyApiService = new MetadataPrivateKeyApiService(apiClientOptions);
    this.getOrFindMetadataKeysService = new GetOrFindMetadataKeysService(account, apiClientOptions);
    this.encryptMetadataPrivateKeysService = new EncryptMetadataPrivateKeysService(account);
    this.findUsersService = new FindUsersService(account, apiClientOptions);
  }

  /**
   * Share missing metadata keys with an expected user.
   * @param {string} userId The user id.
   * @param {string} passphrase The logged user passphrase.
   * @return {Promise<void>}
   * @throws {Error} if the userId parameter is not uuid
   * @throws {Error} if the passphrase parameter is not a string
   * @throws {Error} if the current user is not an administrator
   */
  async shareOneMissing(userId, passphrase) {
    assertUuid(userId, "The user id should be a valid uuid.");
    assertString(passphrase, 'The parameter "passphrase" should be a string.');

    if (this.account.roleName !== RoleEntity.ROLE_ADMIN) {
      throw new Error("This action can only be performed by an administrator.");
    }

    //Users should be stored into localstorage
    const users = await this.userModel.getOrFindAll();
    const targettedUser = users.getFirst("id", userId);
    let missingMetadataKeysIds = targettedUser.missingMetadataKeysIds;

    if (missingMetadataKeysIds.length === 0) {
      return;
    }
    const shareMetadataPrivateKeysCollection = new ShareMetadataPrivateKeysCollection([]);
    const metadataKeysCollection = await this.getOrFindMetadataKeysService.getOrFindAll(passphrase);
    await this.keyring.sync();

    const promises = missingMetadataKeysIds.map(async missingMetadataKeyId => {
      const missingMetadataKey = metadataKeysCollection.getFirst("id", missingMetadataKeyId);

      if (!missingMetadataKey) {
        return null;
      }

      let decryptedUserPrivateKey = null;
      if (missingMetadataKey.metadataPrivateKeys.items[0].dataSignedByCurrentUser) {
        decryptedUserPrivateKey =  await this._getDecryptedPrivateKey(passphrase);
      }
      const clonedSharedMetadataPrivateKey = await missingMetadataKey.metadataPrivateKeys.items[0].cloneForSharing(userId);

      await this.encryptMetadataPrivateKeysService.encryptOne(clonedSharedMetadataPrivateKey, decryptedUserPrivateKey);
      shareMetadataPrivateKeysCollection.push(clonedSharedMetadataPrivateKey);
    });

    await Promise.all(promises);

    if (shareMetadataPrivateKeysCollection.length === 0) {
      return;
    }

    await this.metadataPrivateKeyApiService.create(shareMetadataPrivateKeysCollection);
    const sharedMetadataKeysIds = shareMetadataPrivateKeysCollection.extract("metadata_key_id");
    missingMetadataKeysIds = missingMetadataKeysIds.filter(missingMetadataKey => !sharedMetadataKeysIds.includes(missingMetadataKey));
    targettedUser.missingMetadataKeysIds = missingMetadataKeysIds;
    await UserLocalStorage.updateUser(targettedUser);
  }

  /**
   * Share missing metadata keys with all users.
   * @param {string} passphrase The logged user passphrase.
   * @return {Promise<void>}
   * @throws {Error} if the passphrase parameter is not a string
   * @throws {Error} if the current user is not an administrator
   */
  async shareAllMissing(passphrase) {
    assertString(passphrase, 'The parameter "passphrase" should be a string.');

    if (this.account.roleName !== RoleEntity.ROLE_ADMIN) {
      throw new Error("This action can only be performed by an administrator.");
    }

    const users = await this.findUsersService.findAllActiveWithMissingKeys();
    users.filterByCallback(user => user.missingMetadataKeysIds.length > 0);
    if (users.length === 0) {
      return;
    }

    await this.keyring.sync();
    const shareMetadataPrivateKeysCollection = await this._getMetadataPrivateKeys(passphrase);
    const decryptedUserPrivateKey = await this._getDecryptedPrivateKey(passphrase);
    const shareMetadataPrivateKeysUsersCollection = await this._buildMetadataKeyForUsers(users, shareMetadataPrivateKeysCollection, decryptedUserPrivateKey);
    if (shareMetadataPrivateKeysUsersCollection.length > 0) {
      await this.metadataPrivateKeyApiService.create(shareMetadataPrivateKeysUsersCollection);
    }
  }

  /**
   * Get decrypted private key
   * @param {string} passphrase The passphrase
   * @return {Promise<PrivateKey|null>}
   * @private
   */
  async _getDecryptedPrivateKey(passphrase) {
    const encryptedUserPrivateKey = await OpenpgpAssertion.readKeyOrFail(this.account.userPrivateArmoredKey);
    return await DecryptPrivateKeyService.decrypt(encryptedUserPrivateKey, passphrase);
  }

  /**
   * Get all metadata private key collection to share.
   * @param {string} passphrase The passphrase
   * @returns {Promise<ShareMetadataPrivateKeysCollection>}
   * @private
   */
  async _getMetadataPrivateKeys(passphrase) {
    const metadataKeysCollection = await this.getOrFindMetadataKeysService.getOrFindAll(passphrase);
    const shareMetadataPrivateKeysCollection = new ShareMetadataPrivateKeysCollection([]);
    for (const metadataKeyEntity of metadataKeysCollection) {
      shareMetadataPrivateKeysCollection.pushMany(metadataKeyEntity.metadataPrivateKeys.toDto());
    }
    return shareMetadataPrivateKeysCollection;
  }

  /**
   * Build the metadata private key array for users having missing keys.
   * @param {UsersCollection} users The users.
   * @param {ShareMetadataPrivateKeysCollection} metadataPrivateKeysCollection The metadata private key.
   * @param {PrivateKey|null} decryptedUserPrivateKey The decrypted private key.
   * @returns {Promise<ShareMetadataPrivateKeysCollection>}
   * @private
   */
  async _buildMetadataKeyForUsers(users, metadataPrivateKeysCollection, decryptedUserPrivateKey) {
    const shareMetadataPrivateKeysCollection = new ShareMetadataPrivateKeysCollection([]);

    for (const user of users) {
      for (const metadataPrivateKey of metadataPrivateKeysCollection) {
        const clonedSharedMetadataPrivateKey = await metadataPrivateKey.cloneForSharing(user.id);
        if (metadataPrivateKey.dataSignedByCurrentUser) {
          await this.encryptMetadataPrivateKeysService.encryptOne(clonedSharedMetadataPrivateKey, decryptedUserPrivateKey);
        } else {
          await this.encryptMetadataPrivateKeysService.encryptOne(clonedSharedMetadataPrivateKey, null);
        }
        shareMetadataPrivateKeysCollection.push(clonedSharedMetadataPrivateKey);
      }
    }
    return shareMetadataPrivateKeysCollection;
  }
}
