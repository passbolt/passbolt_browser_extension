/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */
import {v4 as uuidv4} from "uuid";

export const readResource = (data = {}) => {
  const defaultObject = {
    id: uuidv4(),
    name: "Resource",
    uri: "Resource",
    username: "Resource",
    folder_parent_id: null,
    created: "2022-03-04T13:59:11+00:00",
    created_by: uuidv4(),
    modified: "2022-03-04T13:59:11+00:00",
    modified_by: uuidv4(),
    deleted: false,
    description: null,
    personal: false,
    resource_type_id: uuidv4(),
    permission: {},
    permissions: [],
    secrets: []
  };
  return Object.assign(defaultObject, data);
};
