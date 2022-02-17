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
const {pgpKeys} = require("../../../../tests/fixtures/pgpKeys/keys");

const policyDisabledDto = {
  policy: "disabled"
};

const policyOptInWithAdaKeyDto = {
  policy: 'opt-in',
  account_recovery_organization_public_key: {
    armored_key: pgpKeys.ada.public
  }
};

const policyOptInWithIreneKeyDto = {
  policy: 'opt-in',
  account_recovery_organization_public_key: {
    armored_key: pgpKeys.irene.public
  }
};

const adminPrivateKeyDto = {
  armored_key: pgpKeys.admin.private,
  passphrase: "admin@passbolt.com"
};

const adaPrivateKeyDto = {
  armored_key: pgpKeys.ada.private,
  passphrase: "ada@passbolt.com"
};

const privateKeyPasswordsCollectionDto = [{
  "id": "253488a2-e805-46a3-b2f7-39700c251796",
  "recipient_foreign_key": "2afd4daa-7e60-4bb6-bd29-8661e1bf8c3e",
  "recipient_foreign_model": "AccountRecoveryOrganizationKey",
  "data": "-----BEGIN PGP MESSAGE-----",
}];

exports.data = {
  policies: {
    disabled: policyDisabledDto,
    optinWithAdaKey: policyOptInWithAdaKeyDto,
    optinWithIreneKey: policyOptInWithIreneKeyDto,
  },
  privateKeys: {
    admin: adminPrivateKeyDto,
    ada: adaPrivateKeyDto
  },
  privateKeyPasswordsCollection: privateKeyPasswordsCollectionDto,
  mockedPublicKey: "----BEGIN PGP PUBLIC KEY BLOCK-----",
};
