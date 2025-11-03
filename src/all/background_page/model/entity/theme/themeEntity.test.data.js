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
 * @since         5.7.0
 */
import {v4 as uuidv4} from "uuid";

export const defaultThemeDto = (data = {}) => ({
  "id": uuidv4(),
  "name": "default",
  ...data,
});

export const midgarThemeDto = (data = {}) => ({
  "id": uuidv4(),
  "name": "midgar",
  ...data,
});

export const solarisedThemeDto = (data = {}) => ({
  "id": uuidv4(),
  "name": "solarised",
  ...data,
});

export const solarisedDarkThemeDto = (data = {}) => ({
  "id": uuidv4(),
  "name": "solarised_dark",
  ...data,
});
