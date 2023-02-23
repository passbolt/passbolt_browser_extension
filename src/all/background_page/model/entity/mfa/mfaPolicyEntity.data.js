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
 * @since         3.11.0
 */

import MfaPolicyEntity from './mfaPolicyEntity';

export const defaultMfaPolicy = (data = {}) => {
  const defaultData = {
    "policy": MfaPolicyEntity.OPTIN,
    "remember_me_for_a_month":  false
  };
  return Object.assign(defaultData, data);
};

