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
 * @since         4.5.0
 */

import PasswordExpiryResourceService from "../../service/api/passwordExpiry/passwordExpiryResourceService";
import {assertType} from "../../utils/assertions";
import PasswordExpiryResourcesCollection from "../entity/passwordExpiry/passwordExpiryResourcesCollection";
import ResourceLocalStorage from "../../service/local_storage/resourceLocalStorage";

class PasswordExpiryResourceModel {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    this.passwordExpiryResourceService = new PasswordExpiryResourceService(apiClientOptions);
  }

  /**
   * Update the password expiry date of resources on the API.
   * @param {PasswordExpiryResourcesCollection} collection the collection to update
   * @returns {Promise<void|Error>}
   */
  async update(collection) {
    assertType(collection, PasswordExpiryResourcesCollection, 'The given entity is not a PasswordExpiryResourceCollection');
    try {
      await this.passwordExpiryResourceService.update(collection.toDto());
      // Insert the updated resources expiry date in the local storage
      await ResourceLocalStorage.updateResourcesExpiryDate(collection.passwordExpiryResources);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default PasswordExpiryResourceModel;
