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
 */

import ResourceTypesCollection from "../../../entity/resourceType/resourceTypesCollection";
import {v4 as uuidv4} from "uuid";

export function getResourceTypeCollection() {
  const resourceTypeDto = {
    id: uuidv4(),
    name: "Password with description",
    slug: "password-and-description"
  };
  return new ResourceTypesCollection([resourceTypeDto]);
}
