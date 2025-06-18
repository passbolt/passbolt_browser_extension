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
import ShareMetadataPrivateKeysCollection from "../../model/entity/metadata/shareMetadataPrivateKeysCollection";
import GetOrFindMetadataKeysService from "./getOrFindMetadataKeysService";
import EncryptMetadataPrivateKeysService from "./encryptMetadataPrivateKeysService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import Keyring from "../../model/keyring";
import UserLocalStorage from "../local_storage/userLocalStorage";

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
  }

  /**
   * Share missing metadata keys with an expected user.
   * @param {string} userId The user id.
   * @param {passphrase} passphrase The logged user passphrase.
   * @return {Promise<void>}
   * @throws {Error} if the userId parameter is not uuid
   * @throws {Error} if the passphrase parameter is not a string
   * @throws {Error} if the current user is not an administrator
   */
  async shareMissing(userId, passphrase) {
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
    const metadataKeysCollection = await this.getOrFindMetadataKeysService.getOrFindAll();
    await this.keyring.sync();

    const promises = missingMetadataKeysIds.map(async missingMetadataKeyId => {
      const missingMetadataKey = metadataKeysCollection.getFirst("id", missingMetadataKeyId);

      if (!missingMetadataKey) {
        return null;
      }

      let decryptedUserPrivateKey = null;
      if (missingMetadataKey.metadataPrivateKeys.items[0].dataSignedByCurrentUser) {
        const encryptedUserPrivateKey =  await OpenpgpAssertion.readKeyOrFail(this.account.userPrivateArmoredKey);
        decryptedUserPrivateKey = await DecryptPrivateKeyService.decrypt(encryptedUserPrivateKey, passphrase);
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
}
