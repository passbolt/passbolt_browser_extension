/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.0.0
 */
import Log from "../../model/log";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import { assertType } from "../../utils/assertions";
import AbstractLocalStorage from "./abstractLocalStorage";

const RESOURCE_TYPES_LOCAL_STORAGE_KEY = "resource_types";

class ResourceTypeLocalStorage extends AbstractLocalStorage {
  /**
   * Get the key property
   * @return {string}
   */
  get key() {
    return RESOURCE_TYPES_LOCAL_STORAGE_KEY;
  }

  /**
   * Get the entityClass
   * @return {ResourceTypesCollection}
   */
  get entityClass() {
    return ResourceTypesCollection;
  }
}

export default ResourceTypeLocalStorage;
