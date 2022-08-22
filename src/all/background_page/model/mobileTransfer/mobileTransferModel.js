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
 * @since         v3.2.0
 */
import MobileTransferService from "../../service/api/mobileTransferService/mobileTransferService";
import TransferEntity from "../../model/entity/transfer/transferEntity";

class MobileTransferModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.mobileTransferService = new MobileTransferService(apiClientOptions);
  }

  /**
   * Get transfer info using Passbolt API
   *
   * @params {string} transferId uuid
   * @throws {Error} if API call fails, service unreachable, etc.
   * @return {TransferEntity}
   */
  async get(transferId) {
    const transferDto = await this.mobileTransferService.get(transferId);
    return new TransferEntity(transferDto);
  }

  /**
   * Create a transfer using Passbolt API
   *
   * @param {TransferEntity} transferEntity
   * @returns {Promise<TransferEntity>}
   */
  async create(transferEntity) {
    const transferDto = await this.mobileTransferService.create(transferEntity.toDto());
    return new TransferEntity(transferDto);
  }

  /**
   * Update a transfer using Passbolt API
   *
   * @param {TransferEntity} transferEntity
   * @returns {Promise<TransferEntity>}
   */
  async update(transferEntity) {
    const transferDto = await this.mobileTransferService.update(transferEntity.id, transferEntity.toDto());
    return new TransferEntity(transferDto);
  }
}

export default MobileTransferModel;
