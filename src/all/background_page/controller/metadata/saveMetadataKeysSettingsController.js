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
import SaveMetadataSettingsService from "../../service/metadata/saveMetadataSettingsService";
import MetadataKeysSettingsEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity";
import FindMetadataSettingsService from "../../service/metadata/findMetadataSettingsService";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";

class SaveMetadataKeysSettingsController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions the api client options
   * @param {AccountEntity} account the user account
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.saveMetadaSettingsService = new SaveMetadataSettingsService(account, apiClientOptions);
    this.findMetadataSettingsService = new FindMetadataSettingsService(apiClientOptions);
    this.getPassphraseService = new GetPassphraseService(account);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const result = await this.exec.apply(this, arguments);
      this.worker.port.emit(this.requestId, 'SUCCESS', result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Save the metadata keys settings.
   * @param {object} dto The metadata keys settings to save.
   * @returns {Promise<MetadataKeysSettingsEntity>}
   * @throws {EntityValidationError} If the settings dto does not validate against MetadataKeysSettingsEntity
   */
  async exec(dto) {
    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
    const settings = new MetadataKeysSettingsEntity(dto);
    return this.saveMetadaSettingsService.saveKeysSettings(settings, passphrase);
  }
}

export default SaveMetadataKeysSettingsController;
