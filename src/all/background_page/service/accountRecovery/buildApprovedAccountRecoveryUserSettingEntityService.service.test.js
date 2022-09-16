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

import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import BuildApprovedAccountRecoveryUserSettingEntityService from "./buildApprovedAccountRecoveryUserSettingEntityService";
import {enabledAccountRecoveryOrganizationPolicyDto} from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity.test.data";
import AccountRecoveryOrganizationPolicyEntity from "../../model/entity/accountRecovery/accountRecoveryOrganizationPolicyEntity";
import DecryptMessageService from "../crypto/decryptMessageService";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import AccountRecoveryPrivateKeyPasswordDecryptedDataEntity from "../../model/entity/accountRecovery/accountRecoveryPrivateKeyPasswordDecryptedDataEntity";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

describe("BuildApprovedAccountRecoveryUserSettingEntityService service", () => {
  it("Build approved account recovery user setting entity", async() => {
    const account = new AccountEntity(defaultAccountDto());
    const organizationPolicyDto = enabledAccountRecoveryOrganizationPolicyDto();
    const organizationPolicy = new AccountRecoveryOrganizationPolicyEntity(organizationPolicyDto);
    const decryptedPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
    const accountRecoveryUserSetting = await BuildApprovedAccountRecoveryUserSettingEntityService.build(account, decryptedPrivateKey, organizationPolicy);

    expect.assertions(11);
    expect(accountRecoveryUserSetting.isApproved).toBe(true);
    expect(accountRecoveryUserSetting.accountRecoveryPrivateKey).not.toBeNull();
    expect(accountRecoveryUserSetting.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords).not.toBeNull();

    // Ensure the recipient fingerprint is properly set.
    const privateKeyPasswordRecipientFingerprint = accountRecoveryUserSetting.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords.items[0].recipientFingerprint;
    const organizationPolicyFingerprint = organizationPolicyDto.account_recovery_organization_public_key.fingerprint.toUpperCase();
    expect(privateKeyPasswordRecipientFingerprint).toBe(organizationPolicyFingerprint);

    // Ensure the private key password decrypted data match the expected meta.
    const userPrivateKeyPasswordEncrypted = await OpenpgpAssertion.readMessageOrFail(accountRecoveryUserSetting.accountRecoveryPrivateKey.accountRecoveryPrivateKeyPasswords.items[0].data);
    const userPrivateKeyPasswordEncryptedData = await OpenpgpAssertion.readMessageOrFail(accountRecoveryUserSetting.accountRecoveryPrivateKey.data);
    const accountRecoveryPrivateKeyDecrypted = await OpenpgpAssertion.readKeyOrFail(pgpKeys.account_recovery_organization.private_decrypted);
    const userPrivateKeyPasswordDecryptedSerializedDataDto = await DecryptMessageService.decrypt(userPrivateKeyPasswordEncrypted, accountRecoveryPrivateKeyDecrypted, [decryptedPrivateKey]);
    const userPrivateKeyPasswordDecryptedData = new AccountRecoveryPrivateKeyPasswordDecryptedDataEntity(JSON.parse(userPrivateKeyPasswordDecryptedSerializedDataDto));
    expect(userPrivateKeyPasswordDecryptedData.type).toStrictEqual("account-recovery-private-key-password-decrypted-data");
    expect(userPrivateKeyPasswordDecryptedData.version).toStrictEqual("v1");
    expect(userPrivateKeyPasswordDecryptedData.privateKeyUserId).toStrictEqual(account.userId);
    expect(userPrivateKeyPasswordDecryptedData.privateKeyFingerprint).toStrictEqual(account.userKeyFingerprint);
    expect(userPrivateKeyPasswordDecryptedData.privateKeySecret).toHaveLength(128);
    expect(Date.parse(userPrivateKeyPasswordDecryptedData.created)).toBeTruthy();

    // Assert the secret can be used to decrypt the escrow.
    const userPrivateArmoredOpenpgpKeyDecrypted = await DecryptMessageService.decryptSymmetrically(
      userPrivateKeyPasswordEncryptedData,
      userPrivateKeyPasswordDecryptedData.privateKeySecret,
      [decryptedPrivateKey]
    );
    expect(userPrivateArmoredOpenpgpKeyDecrypted.trim()).toEqual(pgpKeys.ada.private_decrypted);
  });

  it("Should throw an error if the provided user private key is not a valid decrypted private pgp key.", async() => {
    const account = new AccountEntity(defaultAccountDto());
    const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
    const resultPromise = BuildApprovedAccountRecoveryUserSettingEntityService.build(account, privateKey, {});

    expect.assertions(1);
    await expect(resultPromise).rejects.toThrow("The private key should be decrypted.");
  });

  it("Should throw an error if the provided organization policy is not a valid AccountRecoveryOrganizationPolicyEntity.", async() => {
    const account = new AccountEntity(defaultAccountDto());
    const organizationPolicy = {};
    const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
    const resultPromise = BuildApprovedAccountRecoveryUserSettingEntityService.build(account, privateKey, organizationPolicy);

    expect.assertions(1);
    await expect(resultPromise).rejects.toThrow("The provided organizationPolicy must be a valid AccountRecoveryOrganizationPolicyEntity.");
  });
});
