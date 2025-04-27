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
 * @since         5.1.0
 */
import {assertType} from "../../utils/assertions";
import MetadataTrustedKeyEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTrustedKeyEntity";
import MetadataKeyEntity
  from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";

class ConfirmMetadataKeyContentCodeService {
  constructor(worker) {
    this.worker = worker;
  }

  /**
   * Request user confirmation to trust new metadata key.
   *
   * @param {MetadataTrustedKeyEntity} metadataTrustedKey The trusted metadata key information.
   * @param {MetadataKeyEntity} metadataKey The metadata key to trust.
   * @return {Promise<boolean>}
   * @throw Error if the parameter does not match entity expected.
   */
  async requestConfirm(metadataTrustedKey, metadataKey) {
    assertType(metadataTrustedKey, MetadataTrustedKeyEntity, 'The given metadata trusted key entity is not a MetadataTrustedKeyEntity');
    assertType(metadataKey, MetadataKeyEntity, 'The given metadata key entity is not a MetadataKeyEntity');

    const data = {
      metadata_trusted_key: metadataTrustedKey.toDto(),
      metadata_key: metadataKey.toContentCodeConfirmTrustRequestDto()
    };

    return await this.worker.port.request("passbolt.metadata-key.trust-confirm", data);
  }
}

export default ConfirmMetadataKeyContentCodeService;
