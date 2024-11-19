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
import PassphraseStorageService from '../session_storage/passphraseStorageService';
import SessionKeysBundleEntity from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundleEntity";
import {assertBoolean, assertString, assertType} from '../../utils/assertions';
import SessionKeysBundlesApiService from "../api/sessionKey/sessionKeysBundlesApiService";
import EncryptSessionKeysBundlesService from "./encryptSessionKeysBundlesService";
import SessionKeysCollection from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysCollection";
import GetOrFindSessionKeysService from "./getOrFindSessionKeysService";
import SessionKeysBundlesSessionStorageService from "../sessionStorage/sessionKeysBundlesSessionStorageService";
import SessionKeysBundleDataEntity
  from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundleDataEntity";

class SaveSessionKeysService {
  /**
   * Constructor
   *
   * @param {AbstractAccountEntity} account the account associated to the worker
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @public
   */
  constructor(account, apiClientOptions) {
    this.account = account;
    this.getOrFindSessionKeysService = new GetOrFindSessionKeysService(account, apiClientOptions);
    this.encryptSessionKeysBundle = new EncryptSessionKeysBundlesService(account);
    this.sessionKeysBundleApiService = new SessionKeysBundlesApiService(apiClientOptions);
    this.sessionKeysBundlesSessionStorageService = new SessionKeysBundlesSessionStorageService(account);
  }

  /**
   * Encrypt session key bundle data. Mutate the original object and replace decrypted data with encrypted one.
   *
   * @param {SessionKeysCollection} sessionKeys The session keys to save.
   * @param {string} [passphrase = null] The passphrase to use to sign the encrypted data.
   * @param {boolean} [retryUpdate = false] Should attempt to save again if the API rejected the update due to outdated data.
   * @returns {Promise}
   */
  async save(sessionKeys, passphrase = null, retryUpdate = false) {
    assertType(sessionKeys, SessionKeysCollection, "The parameter \"sessionKeys\" should be a SessionKeysCollection.");
    if (passphrase !== null) {
      assertString(passphrase, 'The parameter "passphrase" should be a string.');
    }
    assertBoolean(retryUpdate, 'The parameter "retryUpdate" should be a boolean.');

    passphrase = passphrase || await PassphraseStorageService.getOrFail();
    const sessionKeysBundles = await this.getOrFindSessionKeysService.getOrFindAllBundles();
    const sessionKeysBundleData = SessionKeysBundleDataEntity.createFromSessionKeys(sessionKeys);
    const sessionKeysBundle = await this.buildOrGetAndUpdateSessionKeysBundleToSave(sessionKeysBundles, sessionKeysBundleData);
    await this.encryptSessionKeysBundle.encryptOne(sessionKeysBundle, passphrase);
    const savedSessionKeysBundle = await this.saveOrUpdateSessionKeysBundle(sessionKeysBundles, sessionKeysBundle, sessionKeysBundleData);
    await this.deleteOldSessionKeysBundle(sessionKeysBundles, savedSessionKeysBundle);
    await this.sessionKeysBundlesSessionStorageService.set(sessionKeysBundles);
  }

  /**
   * Get the latest session keys bundle from existing ones and update it with the new data. If no session keys bundle
   * was previously persisted, build a new one.
   *
   * @param {SessionKeysBundlesCollection} sessionKeysBundles The collection session keys bundle to look into if any.
   * @param {SessionKeysBundleDataEntity} sessionKeysBundleData The session key bundle data.
   * @returns {Promise<SessionKeysBundleEntity>}
   * @private
   */
  async buildOrGetAndUpdateSessionKeysBundleToSave(sessionKeysBundles, sessionKeysBundleData) {
    if (!sessionKeysBundles.length) {
      return new SessionKeysBundleEntity({data: sessionKeysBundleData.toDto()});
    }

    const sessionKeysBundle = sessionKeysBundles.getByLatestModified();
    sessionKeysBundle.data = sessionKeysBundleData;

    return sessionKeysBundle;
  }

  /**
   * Save or update the session key bundle, and update the collection of given session keys bundles.
   *
   * @param {SessionKeysBundlesCollection} sessionKeysBundles The collection of session keys bundle to look into if any.
   * @param {SessionKeysBundleEntity} sessionKeysBundle Save or update a session key bundle.
   * @param {SessionKeysBundleDataEntity} sessionKeysBundleData The saved session key bundle data decrypted.
   * @returns {Promise<SessionKeysBundleEntity>} The saved session keys bundle dto
   * @private
   */
  async saveOrUpdateSessionKeysBundle(sessionKeysBundles, sessionKeysBundle, sessionKeysBundleData) {
    let savedSessionKeysBundleDto;
    if (sessionKeysBundle.id) {
      savedSessionKeysBundleDto = await this.sessionKeysBundleApiService.update(sessionKeysBundle.id, sessionKeysBundle);
    } else {
      savedSessionKeysBundleDto = await this.sessionKeysBundleApiService.create(sessionKeysBundle);
    }

    const savedSessionKeysBundle = new SessionKeysBundleEntity(savedSessionKeysBundleDto);
    savedSessionKeysBundle.data = sessionKeysBundleData;
    sessionKeysBundles.pushOrReplace(savedSessionKeysBundle);

    return savedSessionKeysBundle;
  }

  /**
   * Delete unused session keys bundles.
   *
   * @param {SessionKeysBundlesCollection} sessionKeysBundles The collection of session keys bundle.
   * @param {SessionKeysBundleEntity} savedSessionKeysBundle The saved session key bundle.
   * @returns {Promise<void>}
   * @private
   */
  async deleteOldSessionKeysBundle(sessionKeysBundles, savedSessionKeysBundle) {
    for (let i = sessionKeysBundles.length - 1; i >= 0; i--) {
      const sessionKeysBundle = sessionKeysBundles.items[i];
      if (sessionKeysBundle.id !== savedSessionKeysBundle.id) {
        await this.sessionKeysBundleApiService.delete(sessionKeysBundle.id);
        sessionKeysBundles.items.splice(i, 1);
      }
    }
  }
}

export default SaveSessionKeysService;
