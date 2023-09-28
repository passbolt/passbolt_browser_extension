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
 * @since         4.3.0
 */
import UserPassphrasePoliciesEntity from "passbolt-styleguide/src/shared/models/entity/userPassphrasePolicies/userPassphrasePoliciesEntity";
import UserPassphrasePoliciesModel from "../../model/userPassphrasePolicies/userPassphrasePoliciesModel";

class SaveUserPassphrasePoliciesController {
  /**
   * SaveUserPassphrasePoliciesController constructor
   * @param {Worker} worker
   * @param {string} requestId uuid
   * @param {ApiClientOptions} apiClientOptions the api client options
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.userPassphrasePoliciesModel = new UserPassphrasePoliciesModel(apiClientOptions);
  }

  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec(userPassphrasePoliciesDto) {
    try {
      const settings = await this.exec(userPassphrasePoliciesDto);
      this.worker.port.emit(this.requestId, "SUCCESS", settings);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Save the given user passphrase policies on the API.
   * @param {UserPassphrasePoliciesDto} userPassphrasePoliciesDto the data to save on the API
   * @returns {Promise<UserPassphrasePoliciesEntities>}
   */
  async exec(userPassphrasePoliciesDto) {
    const entity = new UserPassphrasePoliciesEntity(userPassphrasePoliciesDto);
    return await this.userPassphrasePoliciesModel.save(entity);
  }
}

export default SaveUserPassphrasePoliciesController;
