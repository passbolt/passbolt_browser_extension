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
import {pgpKeys} from "../../../../tests/fixtures/pgpKeys/keys";

export const createAcceptedAccountRecoveryResponseDto = data => {
  const defaultData = {
    "account_recovery_request_id": uuidv4(),
    "responder_foreign_key": uuidv4(),
    "responder_foreign_model": "AccountRecoveryOrganizationKey",
    "status": "approved",
  };

  return Object.assign(defaultData, data || {});
};

export const createRejectedAccountRecoveryResponseDto = data => {
  const defaultData = {
    "account_recovery_request_id": uuidv4(),
    "responder_foreign_key": uuidv4(),
    "responder_foreign_model": "AccountRecoveryOrganizationKey",
    "status": "rejected",
  };

  return Object.assign(defaultData, data || {});
};

/**
 * The Test Account Recovery Request gpg key is used to encrypt the response data.
 * The target private key belong to Ada.
 * The Admin private key was used to sign the encrypted payload.
 * The Organization private key was used to sign the encrypted payload.
 * To know more about the data checkout the AccountRecoveryPrivateKeyPasswordEntity test data.
 */
export const acceptedAccountRecoveryResponseDto = data => {
  const defaultData = createAcceptedAccountRecoveryResponseDto({
    "id": uuidv4(),
    "data": "-----BEGIN PGP MESSAGE-----\n\n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\nTkNSR5Q0i+U4Lj1nLqudb7b3jqo=\n=xRbi\n-----END PGP MESSAGE-----",
    "created": "2020-05-04T20:31:45+00:00",
    "modified": "2020-05-04T20:31:45+00:00",
    "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
  });

  return Object.assign(defaultData, data || {});
};

export const rejectedAccountRecoveryResponseDto = data => {
  const defaultData = createRejectedAccountRecoveryResponseDto({
    "id": uuidv4(),
    "created": "2020-05-04T20:31:45+00:00",
    "modified": "2020-05-04T20:31:45+00:00",
    "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
  });

  return Object.assign(defaultData, data || {});
};

exports.AccountRecoveryRequestEntityTestData = {
  "default": {
    "id": "d4c0e643-3967-443b-93b3-102d902c4510",
    "account_recovery_request_id": "d4c0e643-3967-443b-93b3-102d902c4511",
    "responder_foreign_key": "d4c0e643-3967-443b-93b3-102d909c4515",
    "responder_foreign_model": "AccountRecoveryOrganizationKey",
    "data": pgpKeys.ada.public,
    "status": "approved",
    "created": "2020-05-04T20:31:45+00:00",
    "modified": "2020-05-04T20:31:45+00:00",
    "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
  },
  "minimal": {
    "id": "d4c0e643-3967-443b-93b3-102d902c4510",
    "account_recovery_request_id": "d4c0e643-3967-443b-93b3-102d902c4511",
    "responder_foreign_key": "d4c0e643-3967-443b-93b3-102d909c4515",
    "responder_foreign_model": "AccountRecoveryOrganizationKey",
    "status": "rejected"
  }
};
