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
import {defaultAccountRecoveryPrivateKeyDto} from "./accountRecoveryPrivateKeyEntity.test.data";
import {pgpKeys} from "../../../../../../test/fixtures/pgpKeys/keys";
import {acceptedAccountRecoveryResponseDto} from "./accountRecoveryResponseEntity.test.data";
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";

export const pendingAccountRecoveryRequestDto = (data = {}) => {
  const userId = data.user_id || uuidv4();
  return {
    id: uuidv4(),
    user_id: userId,
    armored_key: pgpKeys.account_recovery_request.public,
    fingerprint: pgpKeys.account_recovery_request.fingerprint,
    status: "pending",
    created: "2020-05-04T20:31:45+00:00",
    modified: "2020-05-04T20:31:45+00:00",
    created_by: "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    modified_by: "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    account_recovery_private_key: defaultAccountRecoveryPrivateKeyDto({
      user_id: userId,
    }),
    creator: defaultUserDto({
      id: userId,
    }),
    ...data
  };
};

export const pendingAccountRecoveryRequestWithoutPrivateKeyDto = (data = {}) => {
  const dto = pendingAccountRecoveryRequestDto(data);
  delete dto.account_recovery_private_key;

  return dto;
};

export const pendingAccountRecoveryRequestWithoutPrivateKeyPasswordDto = (data = {}) => {
  const dto = pendingAccountRecoveryRequestDto(data);
  delete dto.account_recovery_private_key.account_recovery_private_key_passwords;

  return dto;
};

export const approvedAccountRecoveryRequestDto = (data = {}) => pendingAccountRecoveryRequestDto({
  status: "approved",
  account_recovery_responses: [acceptedAccountRecoveryResponseDto()],
  ...data
});

export const approvedAccountRecoveryRequestWithoutPrivateKeyDto = (data = {}) => {
  const dto = approvedAccountRecoveryRequestDto(data);
  delete dto.account_recovery_private_key;

  return dto;
};

export const approvedAccountRecoveryRequestWithoutResponsesDto = (data = {}) => {
  const dto = approvedAccountRecoveryRequestDto(data);
  delete dto.account_recovery_responses;

  return dto;
};

export const pendingAccountRecoveryRequestDtoWithNonStandardCreatorEmail = () => pendingAccountRecoveryRequestDto({
  creator: {
    username: 'ada@passbolt.c'
  }
});

export const pendingAccountRecoveryRequestWithWrongPrivateKeyUserIdDto = () => {
  const dto = pendingAccountRecoveryRequestDto();
  dto.account_recovery_private_key.user_id = uuidv4();

  return dto;
};

export const pendingAccountRecoveryRequestWithInvalidAccountRecoveryPrivateKeyPasswordDto = () => {
  const dto = pendingAccountRecoveryRequestDto();
  dto.account_recovery_private_key.account_recovery_private_key_passwords[0].recipient_foreign_model = "unknown-foreign-model";

  return dto;
};

export const pendingAccountRecoveryRequestWithWrongPrivateKeyIdDto = () => {
  const dto = pendingAccountRecoveryRequestDto();
  dto.account_recovery_private_key.account_recovery_private_key_passwords[0].private_key_id = uuidv4();

  return dto;
};
