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
 * @since         5.6.0
 */


import {assertString, assertType, assertUuid} from "../../../utils/assertions";
import i18n from "../../../sdk/i18n";
import CreateMetadataKeyService from "../createMetadataKeyService";
import ExpireMetadataKeyService from "../expireMetadataKeyService";
import DeleteMetadataKeyService from "../deleteMetadataKeyService";
import ExternalGpgKeyPairEntity
  from "passbolt-styleguide/src/shared/models/entity/gpgkey/external/externalGpgKeyPairEntity";
import RotateResourcesMetadataKeyService from "./rotateResourcesMetadataKeyService";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";

/**
 * The service aims to rotate metadata key.
 */
export default class RotateMetadataKeyService {
  /**
   * @constructor
   * @param {AccountEntity} account the account associated to the worker
   * @param {ApiClientOptions} apiClientOptions The api client options
   * @param {ProgressService} progressService The progress service
   */
  constructor(account, apiClientOptions, progressService) {
    this.progressService = progressService;
    this.createMetadataKeyService = new CreateMetadataKeyService(account, apiClientOptions);
    this.expireMetadataKeyService = new ExpireMetadataKeyService(account, apiClientOptions);
    this.rotateResourcesMetadataKeyService = new RotateResourcesMetadataKeyService(account, apiClientOptions, progressService);
    this.deleteMetadataKeyService = new DeleteMetadataKeyService(apiClientOptions);
  }

  /**
   * Rotate metadata key.
   *
   * @param {ExternalGpgKeyPairEntity} metadataKeyPair The metadata key pair to create.
   * @param {string} currentMetadataKeyId The previous metadata key id.
   * @param {string} passphrase The user passphrase.
   * @returns {Promise<void>}
   * @throws {TypeError} if the `metadataKeyPair` argument is not of type ExternalGpgKeyPairEntity
   * @throws {TypeError} if the `previousMetadataKeyId` argument is not valid uuid
   * @throws {TypeError} if passphrase argument is not a string
   */
  async rotate(metadataKeyPair, currentMetadataKeyId, passphrase) {
    assertType(metadataKeyPair, ExternalGpgKeyPairEntity);
    assertUuid(currentMetadataKeyId);
    assertString(passphrase);

    this.progressService.finishStep(i18n.t("Creating metadata key"));
    // 1. Create the metadata key
    await this.createMetadataKeyService.create(metadataKeyPair, passphrase);
    // 2. Expire the previous metadata key
    this.progressService.finishStep(i18n.t('Expiring metadata key'));
    await this.expireMetadataKeyService.expire(currentMetadataKeyId, passphrase);
    // 3. Rotate resources metadata
    this.progressService.finishStep(i18n.t('Rotating metadata'));
    await this.rotateResourcesMetadataKeyService.rotate(passphrase, {count: 0});
    // 4. Delete the previous metadata key
    this.progressService.finishStep(i18n.t('Deleting metadata key'));
    await this.deleteMetadataKeyService.delete(currentMetadataKeyId);
  }

  /**
   * Resume rotation of metadata key
   * @param {MetadataKeyEntity} metadataKey The metadata key
   * @param {string} passphrase The passphrase
   * @return {Promise<void>}
   */
  async resumeRotate(metadataKey, passphrase) {
    assertType(metadataKey, MetadataKeyEntity);
    assertString(passphrase);

    this.progressService.finishStep(i18n.t("Expiring metadata key"));
    if (metadataKey.expired == null) {
      // 1. Expire the previous metadata key if still active
      await this.expireMetadataKeyService.expire(metadataKey.id, passphrase);
    }
    // 2. Rotate resources metadata
    this.progressService.finishStep(i18n.t('Rotating metadata'));
    await this.rotateResourcesMetadataKeyService.rotate(passphrase, {count: 0});
    // 3. Delete the previous metadata key
    this.progressService.finishStep(i18n.t('Deleting metadata key'));
    await this.deleteMetadataKeyService.delete(metadataKey.id);
  }
}
