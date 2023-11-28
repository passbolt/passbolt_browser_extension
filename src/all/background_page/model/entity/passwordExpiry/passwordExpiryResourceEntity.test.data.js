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
 * @since 4.5.0
 */

import {v4 as uuid} from "uuid";

export const defaultPasswordExpiryResourceDto = (data = {}) => {
  const defaultData = {
    id: uuid(),
    expired: "2023-11-06T10:05:46Z",
  };
  return Object.assign(defaultData, data);
};

export const defaultPasswordExpiryResourceDtoFromApi = (data = {}) => {
  const defaultData = defaultPasswordExpiryResourceDto({
    id: uuid(),
    expired: "2023-11-06T10:05:46Z",
    created: "2023-08-06T10:05:46+00:00",
    created_by: uuid(),
    modified: "2023-08-06T10:05:46+00:00",
    modified_by: uuid()
  });

  return Object.assign(defaultData, data);
};
