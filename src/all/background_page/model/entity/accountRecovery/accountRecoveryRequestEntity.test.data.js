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
import {defaultAccountRecoveryPrivateKeyPasswordDto} from "./accountRecoveryPrivateKeyPasswordEntity.test.data";
import {pgpKeys} from "../../../../tests/fixtures/pgpKeys/keys";

export const defaultAccountRecoveryRequestDto = (data = {}) => {
  const defaultData = {
    "id": uuidv4(),
    "authentication_token_id": uuidv4(),
    "armored_key": pgpKeys.account_recovery_request.public,
    "fingerprint": pgpKeys.account_recovery_request.fingerprint,
    "status": "pending",
    "created": "2020-05-04T20:31:45+00:00",
    "modified": "2020-05-04T20:31:45+00:00",
    "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    "account_recovery_private_key_passwords": [
      defaultAccountRecoveryPrivateKeyPasswordDto()
    ]
  };

  return Object.assign(defaultData, data || {});
};
