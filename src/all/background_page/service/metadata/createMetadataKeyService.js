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
 * @since         4.11.0
 */
import MetadataKeysApiService from "../api/metadata/metadataKeysApiService";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";
import GetGpgKeyInfoService from "../crypto/getGpgKeyInfoService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {assertString, assertType} from "../../utils/assertions";
import FindUsersService from "../user/findUsersService";
import EncryptMetadataPrivateKeysService from "./encryptMetadataPrivateKeysService";
import GetOrFindMetadataSettingsService from "./getOrFindMetadataSettingsService";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import ExternalGpgKeyPairEntity
  from "passbolt-styleguide/src/shared/models/entity/gpgkey/external/externalGpgKeyPairEntity";
import Keyring from "../../model/keyring";

/**
 * The service aims to create metadata key.
 */
export default class CreateMetadataKeyService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.keyring = new Keyring();
    this.findUsersService = new FindUsersService(account, apiClientOptions);
    this.encryptMetadataPrivateKeysService = new EncryptMetadataPrivateKeysService(account);
    this.metadataKeysApiService = new MetadataKeysApiService(apiClientOptions);
    this.getOrFindMetadataSettings = new GetOrFindMetadataSettingsService(account, apiClientOptions);
  }

  /**
   * Create a new metadata key.
   * Note: the service does not handle yet the zero knowledge, the key will be encrypted for the API.
   * @param {ExternalGpgKeyPairEntity} metadataKeyPair The metadata key pair.
   * @param {string} passphrase The user passphrase.
   * @return {MetadataKeyEntity}
   * @throws {TypeError} if metadataKeyPair argument is not of the expected type
   * @throws {TypeError} if passphrase argument is not a string
   */
  async create(metadataKeyPair, passphrase) {
    assertType(metadataKeyPair, ExternalGpgKeyPairEntity);
    assertString(passphrase);

    await this.keyring.sync();
    const users = await this.findUsersService.findAllActive();
    const metadataKey = await this._buildMetadataKey(metadataKeyPair, users);
    const userPrivateKey = await OpenpgpAssertion.readKeyOrFail(this.account.userPrivateArmoredKey);
    const userDecryptedPrivateKey = await DecryptPrivateKeyService.decrypt(userPrivateKey, passphrase);
    await this.encryptMetadataPrivateKeysService.encryptAllFromMetadataKeyEntity(metadataKey, userDecryptedPrivateKey);
    const savedMetadataKeyDto = await this.metadataKeysApiService.create(metadataKey);

    return new MetadataKeyEntity(savedMetadataKeyDto);
  }

  /**
   * Build the metadata key entity to create.
   * @param {ExternalGpgKeyPairEntity} metadataKeyPair The metadata key pair.
   * @param {UsersCollection} users The collection of user to share the key with.
   * @returns {Promise<MetadataKeyEntity>}
   * @private
   */
  async _buildMetadataKey(metadataKeyPair, users) {
    const metadataKeysSettings = await this.getOrFindMetadataSettings.getOrFindKeysSettings();
    const privateKey = await OpenpgpAssertion.readKeyOrFail(metadataKeyPair.privateKey.armoredKey);
    const metadataKeyInfo = await GetGpgKeyInfoService.getKeyInfo(privateKey);
    const metadataPrivateKeysDto = users.items.map(user =>
      this._buildMetadataPrivateKeyDto(metadataKeyPair.privateKey.armoredKey, metadataKeyInfo.fingerprint, user.id));

    if (!metadataKeysSettings.zeroKnowledgeKeyShare) {
      const apiMetadataPrivateKeyDto = this._buildMetadataPrivateKeyDto(metadataKeyPair.privateKey.armoredKey, metadataKeyInfo.fingerprint, null);
      metadataPrivateKeysDto.push(apiMetadataPrivateKeyDto);
    }

    return new MetadataKeyEntity({
      fingerprint: metadataKeyInfo.fingerprint,
      armored_key: metadataKeyPair.publicKey.armoredKey,
      metadata_private_keys: metadataPrivateKeysDto,
    });
  }

  /**
   * Build a metadata private key data dto for a given recipient.
   * @param {string} privateArmoredKey The metadata private armored key
   * @param {string} fingerprint The metadata key fingerprint
   * @param {string|null} [userId=null] The recipient the data will be encrypted for
   * @returns {object}
   * @private
   */
  _buildMetadataPrivateKeyDto(privateArmoredKey, fingerprint, userId = null) {
    return {
      user_id: userId,
      data: {
        object_type: "PASSBOLT_METADATA_PRIVATE_KEY",
        domain: this.account.domain,
        user_id: userId,
        fingerprint: fingerprint,
        armored_key: privateArmoredKey,
        passphrase: "",
      }
    };
  }
}
