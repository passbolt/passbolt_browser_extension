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

import {v4 as uuidv4} from 'uuid';
import {pgpKeys} from "../../../tests/fixtures/pgpKeys/keys";
import {BuildApprovedAccountRecoveryUserSettingEntityService} from "./buildApprovedAccountRecoveryUserSettingEntityService";
import {enabledAccountRecoveryOrganizationPolicyDto} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import {AccountRecoveryOrganizationPolicyEntity} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";
import {DecryptMessageService} from "../crypto/decryptMessageService";

describe("BuildApprovedAccountRecoveryUserSettingEntityService service", () => {
  it("Build approved account recovery user setting entity", async() => {
    const organizationPolicyDto = enabledAccountRecoveryOrganizationPolicyDto();
    const organizationPolicy = new AccountRecoveryOrganizationPolicyEntity(organizationPolicyDto);
    const accountRecoveryUserSetting = await BuildApprovedAccountRecoveryUserSettingEntityService.build(uuidv4(), pgpKeys.ada.private_decrypted, organizationPolicy);

    expect.assertions(5);
    expect(accountRecoveryUserSetting.isApproved).toBe(true);
    expect(accountRecoveryUserSetting.accountRecoveryPrivateKey).not.toBeNull();
    expect(accountRecoveryUserSetting.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords).not.toBeNull();

    // Ensure the recipient fingerprint is properly set.
    const privateKeyPasswordRecipientFingerprint = accountRecoveryUserSetting.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords.items[0].recipientFingerprint;
    const organizationPolicyFingerprint = organizationPolicyDto.account_recovery_organization_public_key.fingerprint.toUpperCase();
    expect(privateKeyPasswordRecipientFingerprint).toBe(organizationPolicyFingerprint);

    // Ensure the escrow can be decrypted.
    const userPrivateKeyPasswordEncrypted = accountRecoveryUserSetting.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords.items[0].data;
    const userPrivateKeyEncrypted = accountRecoveryUserSetting.accountRecoveryPrivateKey.data;
    const symmetricSecret = await DecryptMessageService.decrypt(userPrivateKeyPasswordEncrypted, pgpKeys.account_recovery_organization.private_decrypted, pgpKeys.ada.private_decrypted);
    const userPrivateArmoredOpenpgpKeyDecrypted = await DecryptMessageService.decryptSymmetrically(userPrivateKeyEncrypted, symmetricSecret, pgpKeys.ada.private_decrypted);
    expect(userPrivateArmoredOpenpgpKeyDecrypted.trim()).toEqual(pgpKeys.ada.private_decrypted);
  });

  it("Should throw an error if the provided user private key is not a valid decrypted private pgp key.", async() => {
    const resultPromise = BuildApprovedAccountRecoveryUserSettingEntityService.build(uuidv4(), pgpKeys.ada.private, {});

    expect.assertions(1);
    await expect(resultPromise).rejects.toThrow("The private key should be decrypted.");
  });

  it("Should throw an error if the provided organization policy is not a valid AccountRecoveryOrganizationPolicyEntity.", async() => {
    const organizationPolicy = {};
    const resultPromise = BuildApprovedAccountRecoveryUserSettingEntityService.build(uuidv4(), pgpKeys.ada.private_decrypted, organizationPolicy);

    expect.assertions(1);
    await expect(resultPromise).rejects.toThrow("The provided organizationPolicy must be a valid AccountRecoveryOrganizationPolicyEntity.");
  });
});
