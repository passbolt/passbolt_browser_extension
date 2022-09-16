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
import User from "../model/user";
import MobileTransferModel from "../model/mobileTransfer/mobileTransferModel";
import TransferEntity from "../model/entity/transfer/transferEntity";


const listen = function(worker) {
  /*
   * passbolt.mobile.transfer.get
   *
   * @listens passbolt.mobile.transfer.create
   * @param requestId {uuid} The request identifier
   * @param transferDto {object} The transfer data
   */
  worker.port.on('passbolt.mobile.transfer.get', async(requestId, transferId) => {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const transferModel = new MobileTransferModel(apiClientOptions);
      const transferEntity = await transferModel.get(transferId);
      worker.port.emit(requestId, 'SUCCESS', transferEntity);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * passbolt.mobile.transfer.create
   *
   * @listens passbolt.mobile.transfer.create
   * @param requestId {uuid} The request identifier
   * @param transferDto {object} The transfer data
   */
  worker.port.on('passbolt.mobile.transfer.create', async(requestId, transferDto) => {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const transferModel = new MobileTransferModel(apiClientOptions);
      const transferEntity = new TransferEntity(transferDto);
      const updatedTransferEntity = await transferModel.create(transferEntity);
      worker.port.emit(requestId, 'SUCCESS', updatedTransferEntity);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * passbolt.mobile.transfer.update
   *
   * @listens passbolt.mobile.transfer.update
   * @param requestId {uuid} The request identifier
   * @param transferDto {object} The transfer data
   */
  worker.port.on('passbolt.mobile.transfer.update', async(requestId, transferDto) => {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const transferModel = new MobileTransferModel(apiClientOptions);
      const transferEntity = new TransferEntity(transferDto);
      const updatedTransferEntity = await transferModel.update(transferEntity);
      worker.port.emit(requestId, 'SUCCESS', updatedTransferEntity);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

export const MobileEvents = {listen};
