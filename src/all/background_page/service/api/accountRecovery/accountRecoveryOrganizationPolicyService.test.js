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
import AccountRecoveryOrganizationPolicyService from "./accountRecoveryOrganizationPolicyService";
import {dummyData} from "./accountRecoveryOrganizationPolicyService.test.data";
import Keyring from "../../../model/keyring";
import Gpgauth from "../../../model/gpgauth";

jest.spyOn(Keyring.prototype, "getPublicKeysFromStorage").mockImplementation(() => ({
  keyId1: {
    fingerprint: "03F60E958F4CB29723ACDF761353B5B15D9B054F"
  }
}));
jest.spyOn(Keyring.prototype, "sync").mockImplementation(() => {});

jest.spyOn(Gpgauth.prototype, "getServerKey").mockImplementation(() => ({
  fingerprint: "7D85C136779F2F8BA48F193E1F194E8D4D8CB098"
}));

function checkError(armored_key, errorMessage) {
  const validationPromise = AccountRecoveryOrganizationPolicyService.validatePublicKey(armored_key);
  return expect(validationPromise).rejects.toEqual(new Error(errorMessage));
}

describe("Account recovery validate public key service", () => {
  it("should accept a viable key", () => {
    expect.assertions(1);
    const validationPromise = AccountRecoveryOrganizationPolicyService.validatePublicKey(dummyData.viableKey);
    return expect(validationPromise).resolves.not.toThrow();
  });

  it("should refuse an invalid key", async() => {
    expect.assertions(6);
    await checkError(dummyData.invalidKey, "The key should be a valid openpgp key.");
    await checkError(dummyData.privateKey, "The key should be public.");
    await checkError(dummyData.weakKey, "The key should be at least 4096 bits.");
    await checkError(dummyData.expiredKey, "The key should not have an expiry date.");
    await checkError(dummyData.notAKey, "The key should be a valid openpgp armored key string.");
    await checkError(dummyData.existingKey, "The key is already being used, the organization recovery key must be a new one.");
  });

  it("should refuse the key if it's the same as currently used", () => {
    expect.assertions(1);
    const expectedError = new Error("The key is the current organization recovery key, you must provide a new one.");

    const validationPromise = AccountRecoveryOrganizationPolicyService.validatePublicKey(dummyData.viableKey, dummyData.viableKey);
    return expect(validationPromise).rejects.toEqual(expectedError);
  });
});
