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

export const defaultProfileDto = data => {
  const defaultData = {
    "id": data?.id || uuidv4(),
    "user_id": data?.user_id || uuidv4(),
    "first_name": data?.first_name || "Admin",
    "last_name": data?.last_name || "User",
    "created": data?.created || "2020-04-20T11:32:17+00:00",
    "modified": data?.modified || "2020-04-20T11:32:17+00:00",
    "avatar": {
      "url": {
        "medium": "img\/avatar\/user_medium.png",
        "small": "img\/avatar\/user.png"
      }
    }
  };

  return Object.assign(defaultData, data || {});
};
