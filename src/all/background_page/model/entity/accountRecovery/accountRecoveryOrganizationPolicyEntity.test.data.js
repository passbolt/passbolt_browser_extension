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
import {defaultUserDto} from "../user/userEntity.test.data";
import {pgpKeys} from "../../../../tests/fixtures/pgpKeys/keys";

export const createAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = {
    policy: "opt-out",
    account_recovery_organization_public_key: {
      armored_key: pgpKeys.account_recovery_organization.public
    },
  };

  return Object.assign(defaultData, data || {});
};

export const defaultAccountRecoveryOrganizationPolicyDto = data => {
  const defaultData = {
    id: uuidv4(),
    policy: "opt-out",
    account_recovery_organization_public_key: {
      armored_key: pgpKeys.account_recovery_organization.public
    },
    creator: defaultUserDto(),
    created_by: uuidv4(),
    modified_by: uuidv4(),
    created: "2022-01-13T13:19:04.661Z",
    modified: "2022-01-13T13:19:04.661Z"
  };

  return Object.assign(defaultData, data || {});
};
