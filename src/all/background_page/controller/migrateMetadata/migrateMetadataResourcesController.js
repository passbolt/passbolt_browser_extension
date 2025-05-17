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
 * @since         4.12.0
 */

import PassboltResponsePaginationHeaderEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponsePaginationHeaderEntity";
import MigrateMetadataResourcesService, {MIGRATE_METADATA_BASE_MAIN_STEPS_COUNT} from "../../service/migrateMetadata/migrateMetadataResourcesService";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import ProgressService from "../../service/progress/progressService";
import MigrateMetadataEntity from "passbolt-styleguide/src/shared/models/entity/metadata/migrateMetadataEntity";
import i18n from "../../sdk/i18n";
import Keyring from "../../model/keyring";

export default class MigrateMetadataResourcesController {
  /**
   * @constructor
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @param {AccountEntity} account The user account
   */
  constructor(worker, requestId, apiClientOptions, account) {
    this.worker = worker;
    this.requestId = requestId;
    this.progressService = new ProgressService(worker, "Migrating metadata");
    this.migrateMetadataResourcesService = new MigrateMetadataResourcesService(apiClientOptions, account, this.progressService);
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
   * Run the metadata migration process.
   * @param {object} migrateMetadataDto
   * @returns {Promise<void>}
   */
  async exec(migrateMetadataDto, passboltResponsePaginationHeaderDto) {
    const replayOptions = {count: 0};
    const migrateMetadataEntity = new MigrateMetadataEntity(migrateMetadataDto);
    const paginationHeaderEntity = new PassboltResponsePaginationHeaderEntity(passboltResponsePaginationHeaderDto);

    const passphrase = await this.getPassphraseService.getPassphrase(this.worker);
    const shouldSyncKeyring = !migrateMetadataEntity.sharedContentOnly;

    const stepsCount = MIGRATE_METADATA_BASE_MAIN_STEPS_COUNT // the mandatory migration metadata steps
      + paginationHeaderEntity.pageCount // the number of resource pages to migrate
      + (shouldSyncKeyring ? 1 : 0) // 1 more step if keyring needs to be sync first
      + 1; // the "Done" step

    this.progressService.start(stepsCount, i18n.t("Migrating metadata"));

    try {
      if (shouldSyncKeyring) {
        this.progressService.finishStep(i18n.t("Synchronizing keyring"), true);
        await (new Keyring()).sync();
      }

      await this.migrateMetadataResourcesService.migrate(migrateMetadataEntity, passphrase, replayOptions);
      this.progressService.finishStep(i18n.t("Done"));
    } finally {
      this.progressService.close();
    }
  }
}
