/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.1.0
 */
import RbacsCollection from "passbolt-styleguide/src/shared/models/entity/rbac/rbacsCollection";
import AbstractLocalStorage from "./abstractLocalStorage";

export const RBACS_LOCAL_STORAGE_KEY = "rbac";

class RbacsLocalStorage extends AbstractLocalStorage {
  /**
   * Get the key property
   * @return {string}
   */
  get key() {
    return RBACS_LOCAL_STORAGE_KEY;
  }

  /**
   * Get the entity class
   * @return {RbacsCollection}
   */
  get entityClass() {
    return RbacsCollection;
  }
}

export default RbacsLocalStorage;
