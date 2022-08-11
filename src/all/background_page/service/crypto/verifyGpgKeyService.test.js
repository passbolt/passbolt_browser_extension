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
import VerifyGpgKeyService from "./verifyGpgKeyService";
import {pgpKeys} from '../../../../../test/fixtures/pgpKeys/keys';
import SignGpgKeyService from "./signGpgKeyService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

describe("VerifyGpgKeyService", () => {
  it("should verify a key single signature.", async() => {
    const adminKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public);
    const sigingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
    const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
    const keyToVerify = await SignGpgKeyService.sign(adminKey, [sigingKey]);
    const verified = await VerifyGpgKeyService.verify(keyToVerify, [verifyingKey]);
    expect.assertions(1);
    expect(verified).toBeTruthy();
  });

  it("should verify a key single signature with the presence of other signatures not verified.", async() => {
    const adminKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public);
    const sigingKeys = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.ada.private_decrypted, pgpKeys.betty.private_decrypted]);
    const verifyingKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
    const keyToVerify = await SignGpgKeyService.sign(adminKey, sigingKeys);
    const verified = await VerifyGpgKeyService.verify(keyToVerify, [verifyingKey]);
    expect.assertions(1);
    expect(verified).toBeTruthy();
  });

  it("should verify a key multiple signatures.", async() => {
    const adminKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public);
    const sigingKeys = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.ada.private_decrypted, pgpKeys.betty.private_decrypted]);
    const keyToVerify = await SignGpgKeyService.sign(adminKey, sigingKeys);
    const verifyingKeys = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.ada.public, pgpKeys.betty.public]);
    const verified = await VerifyGpgKeyService.verify(keyToVerify, verifyingKeys);
    expect.assertions(1);
    expect(verified).toBeTruthy();
  });

  it("should verify a key multiple signatures with the presence of other signatures not verified .", async() => {
    const adminKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public);
    const sigingKeys = await OpenpgpAssertion.readAllKeysOrFail([
      pgpKeys.ada.private_decrypted,
      pgpKeys.betty.private_decrypted,
      pgpKeys.account_recovery_organization.private_decrypted
    ]);
    const keyToVerify = await SignGpgKeyService.sign(adminKey, sigingKeys);
    const verifyingKeys = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.ada.public, pgpKeys.betty.public]);
    const verified = await VerifyGpgKeyService.verify(keyToVerify, verifyingKeys);
    expect.assertions(1);
    expect(verified).toBeTruthy();
  });

  it("should fail if it cannot verify a single signature.", async() => {
    const keyToVerify = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public);
    const verifyingKeys = [await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public)];
    const verified = await VerifyGpgKeyService.verify(keyToVerify, verifyingKeys);
    expect.assertions(1);
    expect(verified).toBeFalsy();
  });

  it("should fail if it cannot verify a single signature with the presence of other signatures.", async() => {
    const adminKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public);
    const sigingKeys = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.betty.private_decrypted]);
    const verifyingKeys = [await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public)];
    const keyToVerify = await SignGpgKeyService.sign(adminKey, sigingKeys);
    const verified = await VerifyGpgKeyService.verify(keyToVerify, verifyingKeys);
    expect.assertions(1);
    expect(verified).toBeFalsy();
  });

  it("should fail if it cannot verify multiple signatures.", async() => {
    const keyToVerify = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public);
    const verifyingKeys = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.ada.public, pgpKeys.betty.public]);
    const verified = await VerifyGpgKeyService.verify(keyToVerify, verifyingKeys);
    expect.assertions(1);
    expect(verified).toBeFalsy();
  });

  it("should fail if it cannot verify a single signature with the presence of other signatures.", async() => {
    const adminKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public);
    const sigingKeys = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.account_recovery_organization.private_decrypted]);
    const keyToVerify = await SignGpgKeyService.sign(adminKey, sigingKeys);
    const verifyingKeys = await OpenpgpAssertion.readAllKeysOrFail([pgpKeys.ada.public, pgpKeys.betty.public]);
    const verified = await VerifyGpgKeyService.verify(keyToVerify, verifyingKeys);
    expect.assertions(1);
    expect(verified).toBeFalsy();
  });
});
