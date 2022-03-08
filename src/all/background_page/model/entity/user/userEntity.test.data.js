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

import {v4 as uuidv4} from 'uuid';
import {defaultProfileDto} from "../profile/ProfileEntity.test.data";

export const defaultUserDto = data => {
  const defaultData = {
    "id": uuidv4(),
    "role_id": uuidv4(),
    "username": "admin@passbolt.com",
    "active": true,
    "deleted": false,
    "created": "2020-04-20T11:32:16+00:00",
    "modified": "2020-04-20T11:32:16+00:00",
    "last_logged_in": "2012-07-04T13:39:25+00:00",
    "is_mfa_enabled": false,
    "profile": defaultProfileDto(Object.assign({user_id: data?.id}, JSON.parse(JSON.stringify(data?.profile || {})))),
  };

  return Object.assign(defaultData, data || {});
};

export const users = {
  ada: defaultUserDto({
    username: "ada@passbolt.com",
    profile: {
      first_name: "Ada",
      last_name: "Lovelace"
    }
  }),
  admin: defaultUserDto({
    username: "admin@passbolt.com",
    profile: {
      first_name: "Admin",
      last_name: "User"
    }
  }),
  betty: defaultUserDto({
    username: "betty@passbolt.com",
    profile: {
      first_name: "Betty",
      last_name: "Holberton"
    }
  }),
};
