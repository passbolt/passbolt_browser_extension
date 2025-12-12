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
 * @since         5.8.0
 */

import {v4 as uuidv4} from "uuid";

export const accountSettingsService_midgarThemeDto = (data = {}) => ({
  "id": uuidv4(),
  "value": "midgar",
  "property": "theme",
  ...data,
});

export const accountSettingsService_themesDto = () => ([
  accountSettingsService_midgarThemeDto({value: "default"}),
  accountSettingsService_midgarThemeDto({value: "midgar"}),
  accountSettingsService_midgarThemeDto({value: "solarized_light"}),
]);

export const accountSettingsService_localeDto = (data = {}) => ({
  "id": uuidv4(),
  "value": "en-UK",
  "property": "locale",
  ...data,
});
