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

import {pgpKeys} from "../../../tests/fixtures/pgpKeys/keys";
import {BuildApprovedAccountRecoveryUserSettingEntityService} from "./buildApprovedAccountRecoveryUserSettingEntityService";
import {enabledAccountRecoveryOrganizationPolicyDto} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import {AccountRecoveryOrganizationPolicyEntity} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";
import {DecryptMessageService} from "../crypto/decryptMessageService";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {AccountEntity} from "../../model/entity/account/accountEntity";
import {AccountRecoveryPrivateKeyPasswordDecryptedDataEntity} from "../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordDecryptedDataEntity";

describe("BuildApprovedAccountRecoveryUserSettingEntityService service", () => {
  it("Build approved account recovery user setting entity", async() => {
    const account = new AccountEntity(defaultAccountDto());
    const organizationPolicyDto = enabledAccountRecoveryOrganizationPolicyDto();
    const organizationPolicy = new AccountRecoveryOrganizationPolicyEntity(organizationPolicyDto);
    const accountRecoveryUserSetting = await BuildApprovedAccountRecoveryUserSettingEntityService.build(account, pgpKeys.ada.private_decrypted, organizationPolicy);

    expect.assertions(11);
    expect(accountRecoveryUserSetting.isApproved).toBe(true);
    expect(accountRecoveryUserSetting.accountRecoveryPrivateKey).not.toBeNull();
    expect(accountRecoveryUserSetting.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords).not.toBeNull();

    // Ensure the recipient fingerprint is properly set.
    const privateKeyPasswordRecipientFingerprint = accountRecoveryUserSetting.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords.items[0].recipientFingerprint;
    const organizationPolicyFingerprint = organizationPolicyDto.account_recovery_organization_public_key.fingerprint.toUpperCase();
    expect(privateKeyPasswordRecipientFingerprint).toBe(organizationPolicyFingerprint);

    // Ensure the private key password decrypted data match the expected meta.
    const userPrivateKeyPasswordEncrypted = accountRecoveryUserSetting.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords.items[0].data;
    const userPrivateKeyPasswordEncryptedData = accountRecoveryUserSetting.accountRecoveryPrivateKey.data;
    const userPrivateKeyPasswordDecryptedSerializedDataDto = await DecryptMessageService.decrypt(userPrivateKeyPasswordEncrypted, pgpKeys.account_recovery_organization.private_decrypted, pgpKeys.ada.private_decrypted);
    const userPrivateKeyPasswordDecryptedData = new AccountRecoveryPrivateKeyPasswordDecryptedDataEntity(JSON.parse(userPrivateKeyPasswordDecryptedSerializedDataDto));
    expect(userPrivateKeyPasswordDecryptedData.type).toStrictEqual("account-recovery-private-key-password-decrypted-data");
    expect(userPrivateKeyPasswordDecryptedData.version).toStrictEqual("v1");
    expect(userPrivateKeyPasswordDecryptedData.privateKeyUserId).toStrictEqual(account.userId);
    expect(userPrivateKeyPasswordDecryptedData.privateKeyFingerprint).toStrictEqual(account.userKeyFingerprint);
    expect(userPrivateKeyPasswordDecryptedData.privateKeySecret).toHaveLength(128);
    expect(Date.parse(userPrivateKeyPasswordDecryptedData.created)).toBeTruthy();

    // Assert the secret can be used to decrypt the escrow.
    const userPrivateArmoredOpenpgpKeyDecrypted = await DecryptMessageService.decryptSymmetrically(userPrivateKeyPasswordEncryptedData, userPrivateKeyPasswordDecryptedData.privateKeySecret, pgpKeys.ada.private_decrypted);
    expect(userPrivateArmoredOpenpgpKeyDecrypted.trim()).toEqual(pgpKeys.ada.private_decrypted);
  });

  it("Should throw an error if the provided user private key is not a valid decrypted private pgp key.", async() => {
    const account = new AccountEntity(defaultAccountDto());
    const resultPromise = BuildApprovedAccountRecoveryUserSettingEntityService.build(account, pgpKeys.ada.private, {});

    expect.assertions(1);
    await expect(resultPromise).rejects.toThrow("The private key should be decrypted.");
  });

  it("Should throw an error if the provided organization policy is not a valid AccountRecoveryOrganizationPolicyEntity.", async() => {
    const account = new AccountEntity(defaultAccountDto());
    const organizationPolicy = {};
    const resultPromise = BuildApprovedAccountRecoveryUserSettingEntityService.build(account, pgpKeys.ada.private_decrypted, organizationPolicy);

    expect.assertions(1);
    await expect(resultPromise).rejects.toThrow("The provided organizationPolicy must be a valid AccountRecoveryOrganizationPolicyEntity.");
  });
});