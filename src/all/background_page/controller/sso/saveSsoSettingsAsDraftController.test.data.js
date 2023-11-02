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
 * @since         3.9.0
 */

import {v4 as uuid} from 'uuid';

export function withAzureSsoSettings(data = {}) {
  const defaultData = {
    provider: "azure",
    data: {
      url: "https://login.microsoftonline.com/..",
      tenant_id: uuid(),
      client_id: uuid(),
      client_secret: "u8x!A%D*G-KaPdSgVkYp3s6v9y$B?E..",
      client_secret_expiry: "2022-11-02",
    },
  };

  return {
    ...defaultData,
    ...data
  };
}
