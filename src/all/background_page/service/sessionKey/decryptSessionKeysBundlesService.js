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
 * @since         4.10.1
 */
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import PassphraseStorageService from '../session_storage/passphraseStorageService';
import SessionKeysBundleEntity from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundleEntity";
import SessionKeysBundleDataEntity from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundleDataEntity";
import SessionKeysBundlesCollection from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection";
import {assertType} from '../../utils/assertions';
import DecryptPrivateKeyService from '../crypto/decryptPrivateKeyService';
import DecryptMessageService from '../crypto/decryptMessageService';

class DecryptSessionKeysBundlesService {
  /**
   * @constructor
   * @param {AbstractAccountEntity} account the account associated to the worker
   */
  constructor(account) {
    this.account = account;
  }

  /**
   * Decrypts a session keys bundle and mutate the entity data property with the decrypted result.
   * If the bundle was already decrypted, nothing happens.
   *
   * @param {SessionKeysBundleEntity} sessionKeysBundleEntity the session key bundle entity to decrypt.
   * @param {string|null} [passphrase = null] The passphrase to use to decrypt the session key bundle. Marked as optional
   * as it might be available in the passphrase session storage.
   * @returns {Promise<void>}
   * @throws {TypeError} if the `sessionKeysBundleEntity` is not of the expected type
   * @throws {Error} if session keys bundle entity data is not a valid openPGP message.
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   */
  async decryptOne(sessionKeysBundleEntity, passphrase = null) {
    assertType(sessionKeysBundleEntity, SessionKeysBundleEntity, "The given entity is not a SessionKeysBundleEntity");
    if (sessionKeysBundleEntity.isDecrypted) {
      return;
    }
    const message = await OpenpgpAssertion.readMessageOrFail(sessionKeysBundleEntity.data);

    passphrase = passphrase || await PassphraseStorageService.getOrFail();

    const userDecryptedPrivateArmoredKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    const decryptedMessage = await DecryptMessageService.decrypt(message, userDecryptedPrivateArmoredKey);
    const decryptedMetadataPrivateKeyDto = JSON.parse(decryptedMessage);
    const sessionKeysBundleDataEntity = new SessionKeysBundleDataEntity(decryptedMetadataPrivateKeyDto);

    sessionKeysBundleEntity.data = sessionKeysBundleDataEntity;
  }

  /**
   * Decrypts a collection of session keys bundle entities and mutate all entities with their decrypted result.
   *
   * @param {SessionKeysBundlesCollection} sessionKeysBundlesCollection the session keys bundles collection to decrypt.
   * @param {string|null} [passphrase = null] The passphrase to use to decrypt the session key bundles. Marked as optional
   * as it might be available in the passphrase session storage.
   * @returns {Promise<void>}
   * @throws {TypeError} if the `sessionKeysBundlesCollection` is not of type SessionKeysBundlesCollection
   * @throws {Error} if one of the session keys bundle entity data is not a valid openPGP message.
   * @throws {UserPassphraseRequiredError} if the `passphrase` is not set and cannot be retrieved.
   */
  async decryptAll(sessionKeysBundlesCollection, passphrase = null) {
    assertType(sessionKeysBundlesCollection, SessionKeysBundlesCollection, "The given collection is not of the type SessionKeysBundlesCollection");

    passphrase = passphrase || await PassphraseStorageService.getOrFail();

    const items = sessionKeysBundlesCollection.items;
    for (let i = 0; i < items.length; i++) {
      const sessionKeysBundleEntity = items[i];
      await this.decryptOne(sessionKeysBundleEntity, passphrase);
    }
  }
}

export default DecryptSessionKeysBundlesService;
