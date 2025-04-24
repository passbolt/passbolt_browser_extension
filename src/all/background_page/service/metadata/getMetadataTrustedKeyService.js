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

import MetadataTrustedKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTrustedKeyEntity";
import TrustedMetadataKeyLocalStorage from "../local_storage/trustedMetadataKeyLocalStorage";

class GetMetadataTrustedKeyService {
  /**
   * Constructor
   *
   * @param {AccountEntity} account the account associated to the worker
   * @public
   */
  constructor(account) {
    this.trustedMetadataKeyLocalStorage = new TrustedMetadataKeyLocalStorage(account);
  }

  /**
   * Retrieve the trusted metadata key from localstorage
   * @return {Promise<MetadataTrustedKey|null>}
   */
  async get() {
    const metadataTrustedKeyFromLocalstorage = await this.trustedMetadataKeyLocalStorage.get();
    if (metadataTrustedKeyFromLocalstorage) {
      return new MetadataTrustedKeyEntity(metadataTrustedKeyFromLocalstorage);
    }
    return null;
  }
}

export default GetMetadataTrustedKeyService;
