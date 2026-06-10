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
 * @since         6.0.0
 */
import AbstractLocalStorage from "./abstractLocalStorage";
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";

export class TestLocalStorage extends AbstractLocalStorage {
  get key() {
    return "test_local_storage";
  }

  get entityClass() {
    return TestEntityLocalStorage;
  }
}

export class TestEntityLocalStorage extends EntityV2 {
  static getSchema() {
    return {
      type: "object",
      required: ["name"],
      properties: {
        id: {
          type: "string",
          format: "uuid",
          nullable: true,
        },
        name: {
          type: "string",
          nullable: true,
        },
      },
    };
  }
}
