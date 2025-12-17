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
 * @since         5.9.0
 */
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import UpdateSubscriptionEntity from "../../model/entity/subscription/update/updateSubscriptionEntity";

export const API_CLIENT_OPTIONS = defaultApiClientOptions();

export const NEW_KEY = "a new valid subscription key";

export const NEW_KEY_DTO = new UpdateSubscriptionEntity({
  data: NEW_KEY,
});

export const UPDATED_KEY_DTO = {
  subscription_id: "dev",
  users: 50,
  expiry: "4096-01-01",
  created: "2025-01-01",
  data: NEW_KEY,
};
