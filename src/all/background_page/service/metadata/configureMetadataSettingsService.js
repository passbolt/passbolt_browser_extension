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
 * @since         5.4.0
 */
import MetadataTypesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import MetadataKeysSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";
import GenerateMetadataKeyService from "./generateMetadataKeyService";
import CreateMetadataKeyService from "./createMetadataKeyService";
import SaveMetadataSettingsService from "./saveMetadataSettingsService";
import {assertString} from "../../utils/assertions";
import FindMetadataGettingStartedSettingsService from "passbolt-styleguide/src/shared/services/metadata/findMetadataGettingStartedSettingsService";

/**
 * The service aims to orchestrate the enablement of the metadata encryption.
 */
export default class ConfigureMetadataSettingsService {
  /**
   * @constructor
   * @param {AccountEntity} account The user account
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(account, apiClientOptions) {
    this.generateMetadataKeyService = new GenerateMetadataKeyService(account);
    this.createMetadataKeyService = new CreateMetadataKeyService(account, apiClientOptions);
    this.saveMetadaSettingsService = new SaveMetadataSettingsService(account, apiClientOptions);
    this.findMetadataGettingStartedSettingsService = new FindMetadataGettingStartedSettingsService(apiClientOptions);
  }

  /**
   * Enables metadata encryption with confuguration that matches a new instance.
   * @param {string} passphrase
   * @return {Promise<void>}
   * @throws {TypeError} if the `passphrase` is not a valid string
   */
  async enableEncryptedMetadataForNewInstance(passphrase) {
    assertString(passphrase);

    const gpgKeyPairEntity = await this.generateMetadataKeyService.generateKey(passphrase);
    await this.createMetadataKeyService.create(gpgKeyPairEntity, passphrase);

    const metadataKeySettings = MetadataKeysSettingsEntity.createFromDefault();
    await this.saveMetadaSettingsService.saveKeysSettings(metadataKeySettings);

    const metadataTypeSettings = MetadataTypesSettingsEntity.createFromV5Default();
    await this.saveMetadaSettingsService.saveTypesSettings(metadataTypeSettings);
  }

  /**
   * Enables metadata encryption with confuguration that matches an existing instance.
   * @param {string} passphrase
   * @return {Promise<void>}
   * @throws {TypeError} if the `passphrase` is not a valid string
   */
  async enableEncryptedMetadataForExistingInstance(passphrase) {
    await this.assertProcessIsEnabled();
    assertString(passphrase);

    const gpgKeyPairEntity = await this.generateMetadataKeyService.generateKey(passphrase);
    await this.createMetadataKeyService.create(gpgKeyPairEntity, passphrase);

    const metadataKeySettings = MetadataKeysSettingsEntity.createFromDefault();
    await this.saveMetadaSettingsService.saveKeysSettings(metadataKeySettings);

    const metadataTypeSettings = MetadataTypesSettingsEntity.createFromV5Default({
      allow_v4_v5_upgrade: true,
    });
    await this.saveMetadaSettingsService.saveTypesSettings(metadataTypeSettings);
  }

  /**
   * Configure metadata settings to keep legacy metadata in cleartext.
   * @return {Promise<void>}
   */
  async keepCleartextMetadataForExistingInstance() {
    await this.assertProcessIsEnabled();
    const metadataTypeSettings = MetadataTypesSettingsEntity.createFromV4Default();
    await this.saveMetadaSettingsService.saveTypesSettings(metadataTypeSettings);
  }

  /**
   * Asserts that the process can be run before proceeding.
   * @returns {Promise<void>}
   * @throws {Error}
   */
  async assertProcessIsEnabled() {
    const gettingStartedEntity = await this.findMetadataGettingStartedSettingsService.findGettingStartedSettings();
    if (!gettingStartedEntity.enabled) {
      throw new Error("The metadata encryption strategy has been already chosen.");
    }
  }
}
