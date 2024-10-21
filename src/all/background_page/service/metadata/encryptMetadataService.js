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
 * @since         4.10.0
 */
import PassphraseStorageService from '../session_storage/passphraseStorageService';
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import FindMetadataKeysService from "./findMetadataKeysService";
import EncryptMessageService from "../crypto/encryptMessageService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import {assertAnyTypeOf} from "../../utils/assertions";
import FolderEntity from "../../model/entity/folder/folderEntity";

class EncryptMetadataService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   * @param {AbstractAccountEntity} account the account associated to the worker
   */
  constructor(apiClientOptions, account) {
    this.findMetadataKeysService = new FindMetadataKeysService(apiClientOptions, account);
    this.account = account;
  }

  /**
   * Encrypts an entity.
   *
   * @param {ResourceEntity|FolderEntity} entity the entity to encrypt.
   * @param {string} [passphrase = null] The passphrase to use to decrypt the metadata private key.
   * @returns {Promise<void>}
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   * @throws {Error} if metadata key cannot be retrieved.
   * @throws {Error} if metadata is already encrypted.
   */
  async encryptOneForForeignModel(entity, passphrase = null) {
    assertAnyTypeOf(entity, [ResourceEntity, FolderEntity], "The given data type is not a ResourceEntity or a FolderEntity");

    // Do nothing is metadata is already encrypted
    if (!entity.isMetadataDecrypted()) {
      throw new Error("Unable to encrypt the entity metadata, metadata is already encrypted.");
    }

    passphrase = passphrase || await this.getPassphraseFromLocalStorageOrFail();
    const userPrivateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    const serializedMetadata = JSON.stringify(entity.metadata.toDto());

    let encryptedMetadata;
    if (entity.isPersonal()) {
      const userPublicKey = await OpenpgpAssertion.readKeyOrFail(this.account.userPublicArmoredKey);
      encryptedMetadata = await EncryptMessageService.encrypt(serializedMetadata, userPublicKey, [userPrivateKey]);
      entity._props.metadata_key_id = null;
      entity.metadataKeyType = ResourceEntity.METADATA_KEY_TYPE_USER_KEY;
    } else {
      const {metadataKeyId, metadataPublicKey, metadataPrivateKey} = await this.getLatestMetadataKeysAndId();
      encryptedMetadata = await EncryptMessageService.encrypt(serializedMetadata, metadataPublicKey, [userPrivateKey, metadataPrivateKey]);
      entity.metadataKeyId = metadataKeyId;
      entity.metadataKeyType = ResourceEntity.METADATA_KEY_TYPE_METADATA_KEY;
    }
    entity.metadata = encryptedMetadata;
  }

  /**
   * Retrieve the id and keys from latest metadataKeysCollection.
   *
   * @returns {Promise<{id: string, metadataPublicKey: openpgp.PublicKey, metadataPrivateKey: openpgp.PrivateKey>}
   * @private
   */
  async getLatestMetadataKeysAndId() {
    const metadataKeysCollection = await this.findMetadataKeysService.findAllForSessionStorage();
    const metadataKeyEntity = metadataKeysCollection.getFirstByLatestCreated();
    if (metadataKeyEntity === null) {
      throw new Error("Unable to encrypt the entity metadata, no metadata key found.");
    }
    const metadataPrivateKeyEntity = metadataKeyEntity.metadataPrivateKeys?.items[0];
    if (!metadataPrivateKeyEntity?.isDecrypted) {
      throw new Error("Unable to encrypt the entity metadata, metadata private key is not decrypted.");
    }
    const metadataPublicKey = await OpenpgpAssertion.readKeyOrFail(metadataKeyEntity.armoredKey);
    const metadataPrivateKey = await OpenpgpAssertion.readKeyOrFail(metadataPrivateKeyEntity.data.armoredKey);
    const metadataKeyId = metadataKeyEntity.id;
    return {metadataKeyId, metadataPublicKey, metadataPrivateKey};
  }

  /**
   * Retrieve the user passphrase from the local storage or fail.
   *
   * @returns {Promise<string>}
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   * @private
   */
  async getPassphraseFromLocalStorageOrFail() {
    const passphrase = await PassphraseStorageService.get();
    if (!passphrase) {
      throw new UserPassphraseRequiredError();
    }
    return passphrase;
  }
}

export default EncryptMetadataService;
