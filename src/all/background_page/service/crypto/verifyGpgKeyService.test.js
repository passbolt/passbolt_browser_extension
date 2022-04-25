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
import {VerifyGpgKeyService} from "./verifyGpgKeyService";
import {pgpKeys} from '../../../tests/fixtures/pgpKeys/keys';
import {SignGpgKeyService} from "./signGpgKeyService";

describe("VerifyGpgKeyService", () => {
  it("should verify a key single signature.", async() => {
    const keyToVerify = await SignGpgKeyService.sign(pgpKeys.admin.public, pgpKeys.ada.private_decrypted);
    const verifyingKey = pgpKeys.ada.public;
    const verified = await VerifyGpgKeyService.verify(keyToVerify, verifyingKey);
    expect.assertions(1);
    expect(verified).toBeTruthy();
  });

  it("should verify a key single signature with the presence of other signatures not verified.", async() => {
    const keyToVerify = await SignGpgKeyService.sign(pgpKeys.admin.public, [pgpKeys.ada.private_decrypted, pgpKeys.betty.private_decrypted]);
    const verifyingKey = pgpKeys.ada.public;
    const verified = await VerifyGpgKeyService.verify(keyToVerify, verifyingKey);
    expect.assertions(1);
    expect(verified).toBeTruthy();
  });

  it("should verify a key multiple signatures.", async() => {
    const keyToVerify = await SignGpgKeyService.sign(pgpKeys.admin.public, [pgpKeys.ada.private_decrypted, pgpKeys.betty.private_decrypted]);
    const verifyingKeys = [pgpKeys.ada.public, pgpKeys.betty.public];
    const verified = await VerifyGpgKeyService.verify(keyToVerify, verifyingKeys);
    expect.assertions(1);
    expect(verified).toBeTruthy();
  });

  it("should verify a key multiple signatures with the presence of other signatures not verified .", async() => {
    const keyToVerify = await SignGpgKeyService.sign(pgpKeys.admin.public, [pgpKeys.ada.private_decrypted, pgpKeys.betty.private_decrypted, pgpKeys.account_recovery_organization.private_decrypted]);
    const verifyingKeys = [pgpKeys.ada.public, pgpKeys.betty.public];
    const verified = await VerifyGpgKeyService.verify(keyToVerify, verifyingKeys);
    expect.assertions(1);
    expect(verified).toBeTruthy();
  });

  it("should fail if it cannot verify a single signature.", async() => {
    const keyToVerify = pgpKeys.admin.public;
    const verifyingKeys = pgpKeys.ada.public;
    const verified = await VerifyGpgKeyService.verify(keyToVerify, verifyingKeys);
    expect.assertions(1);
    expect(verified).toBeFalsy();
  });

  it("should fail if it cannot verify a single signature with the presence of other signatures.", async() => {
    const keyToVerify = await SignGpgKeyService.sign(pgpKeys.admin.public, [pgpKeys.betty.private_decrypted]);
    const verifyingKeys = pgpKeys.ada.public;
    const verified = await VerifyGpgKeyService.verify(keyToVerify, verifyingKeys);
    expect.assertions(1);
    expect(verified).toBeFalsy();
  });

  it("should fail if it cannot verify multiple signatures.", async() => {
    const keyToVerify = pgpKeys.admin.public;
    const verifyingKeys = [pgpKeys.ada.public, pgpKeys.betty.public];
    const verified = await VerifyGpgKeyService.verify(keyToVerify, verifyingKeys);
    expect.assertions(1);
    expect(verified).toBeFalsy();
  });

  it("should fail if it cannot verify a single signature with the presence of other signatures.", async() => {
    const keyToVerify = await SignGpgKeyService.sign(pgpKeys.admin.public, [pgpKeys.account_recovery_organization.private_decrypted]);
    const verifyingKeys = [pgpKeys.ada.public, pgpKeys.betty.public];
    const verified = await VerifyGpgKeyService.verify(keyToVerify, verifyingKeys);
    expect.assertions(1);
    expect(verified).toBeFalsy();
  });
});
