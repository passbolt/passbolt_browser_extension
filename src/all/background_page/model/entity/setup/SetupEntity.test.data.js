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

import {ExternalGpgKeyEntityFixtures} from "../gpgkey/external/externalGpgKeyEntity.test.fixtures";
import {defaultUserDto} from "../user/userEntity.test.data";
import {defaultSecurityTokenDto} from "../securityToken/SecurityTokenEntity.test.data";
import {pgpKeys} from "../../../../tests/fixtures/pgpKeys/keys";
import {defaultAccountRecoveryOrganizationPolicyDto} from "../accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";

export const step0SetupRequestInitializedDto = data => {
  const defaultData = {
    domain: "https://passbolt.local",
    user_id: "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    token: "62748a2c-9b68-4b04-9e92-1721042418af",
    user: defaultUserDto(),
    account_recovery_organization_policy: defaultAccountRecoveryOrganizationPolicyDto()
  };

  return Object.assign(defaultData, data || {});
};

export const step1SetupServerKeyRetrievedDto = data => {
  const defaultData = step0SetupRequestInitializedDto({
    server_public_armored_key: ExternalGpgKeyEntityFixtures.minimal_dto.armored_key,
  });

  return Object.assign(defaultData, data || {});
};

export const step2SetupUserGpgKeyDto = data => {
  const defaultData = step1SetupServerKeyRetrievedDto({
    user_key_fingerprint: pgpKeys.ada.fingerprint,
    user_public_armored_key: pgpKeys.ada.public,
    user_private_armored_key: pgpKeys.ada.private,
    passphrase: pgpKeys.ada.passphrase
  });

  return Object.assign(defaultData, data || {});
};

export const step3SetupSecurityTokenDto = data => {
  const defaultData = step2SetupUserGpgKeyDto({
    security_token: defaultSecurityTokenDto(),
  });

  return Object.assign(defaultData, data || {});
};
