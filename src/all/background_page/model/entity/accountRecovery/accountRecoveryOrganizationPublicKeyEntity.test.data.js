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
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";

// Create account recovery organization public key

export const createAccountRecoveryOrganizationPublicKeyDto = data => {
  const defaultData = {
    armored_key: pgpKeys.account_recovery_organization.public,
    fingerprint: pgpKeys.account_recovery_organization.fingerprint,
  };

  return Object.assign(defaultData, data || {});
};

export const defaultAccountRecoveryOrganizationPublicKeyDto = data => {
  const defaultData = createAccountRecoveryOrganizationPublicKeyDto({
    id: uuidv4(),
    created_by: uuidv4(),
    modified_by: uuidv4(),
    created: "2022-01-13T13:19:04.661Z",
    modified: "2022-01-13T13:19:04.661Z"
  });

  return Object.assign(defaultData, data || {});
};

// Create account recovery organization public key with alternative key

export const createAlternativeAccountRecoveryOrganizationPublicKeyDto = data => {
  const defaultData = {
    armored_key: pgpKeys.account_recovery_organization_alternative.public,
    fingerprint: pgpKeys.account_recovery_organization_alternative.fingerprint,
  };

  return Object.assign(defaultData, data || {});
};

export const alternativeAccountRecoveryOrganizationPublicKeyDto = data => {
  const defaultData = createAccountRecoveryOrganizationPublicKeyDto({
    id: uuidv4(),
    created_by: uuidv4(),
    modified_by: uuidv4(),
    created: "2022-01-13T13:19:04.661Z",
    modified: "2022-01-13T13:19:04.661Z"
  });

  return Object.assign(defaultData, data || {});
};

// Create revoked account recovery organization public key

export const createRevokedAccountRecoveryOrganizationPublicKeyDto = data => {
  const defaultData = {
    armored_key: pgpKeys.account_recovery_organization.revoked,
    fingerprint: pgpKeys.account_recovery_organization.fingerprint,
  };

  return Object.assign(defaultData, data || {});
};

export const revokedAccountRecoveryOrganizationPublicKeyDto = data => {
  const defaultData = createRevokedAccountRecoveryOrganizationPublicKeyDto({
    id: uuidv4(),
    created_by: uuidv4(),
    modified_by: uuidv4(),
    created: "2022-01-13T13:19:04.661Z",
    modified: "2022-01-13T13:19:04.661Z"
  });

  return Object.assign(defaultData, data || {});
};
