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
 * @since         4.7.0
 */

import {v4 as uuidv4} from "uuid";
import {startAccountSetupDto} from "./accountSetupEntity.test.data";
import {startWithApprovedAccountRecoveryAccountRecoverDto} from "./accountRecoverEntity.test.data";
import {defaultAccountAccountRecoveryDto} from "./accountAccountRecoveryEntity.test.data";

export const temporarySetupAccountDto = (data = {}) => {
  const defaultData = {
    account: startAccountSetupDto(),
    worker_id: uuidv4()
  };

  return Object.assign(defaultData, data);
};

export const temporaryRecoverAccountDto = (data = {}) => {
  const defaultData = {
    account: startWithApprovedAccountRecoveryAccountRecoverDto(),
    worker_id: uuidv4()
  };

  return Object.assign(defaultData, data);
};

export const temporaryAccountRecoveryAccountDto = (data = {}) => {
  const defaultData = {
    account: defaultAccountAccountRecoveryDto(),
    worker_id: uuidv4()
  };

  return Object.assign(defaultData, data);
};
