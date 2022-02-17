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
import {AccountRecoveryOrganizationPolicyService} from "./accountRecoveryOrganizationPolicyService";
import {dummyData} from "./accountRecoveryOrganizationPolicyService.test.data";

jest.mock('../../../model/keyring', () => {
  const keyList = {
    keyId1: {
      fingerprint: "03f60e958f4cb29723acdf761353b5b15d9b054f"
    }
  };

  return {
    Keyring: jest.fn().mockImplementation(() => ({
      sync: async() => { },
      getPublicKeysFromStorage: () => keyList
    }))
  };
});

jest.mock('../../../model/gpgauth', () => {
  const serverKey = {
    fingerprint: "7d85c136779f2f8ba48f193e1f194e8d4d8cb098"
  };

  return {
    GpgAuth: jest.fn().mockImplementation(() => ({
      getServerKey: async() => serverKey
    }))
  };
});

function checkError(armored_key, errorMessage) {
  const validationPromise = AccountRecoveryOrganizationPolicyService.validatePublicKey({armored_key: armored_key});
  return expect(validationPromise).rejects.toEqual(new Error(errorMessage));
}

describe("Account recovery validate public key service", () => {
  it("should accept a viable key", () => {
    expect.assertions(1);
    const validationPromise = AccountRecoveryOrganizationPolicyService.validatePublicKey({armored_key: dummyData.viableKey});
    return expect(validationPromise).resolves.not.toThrow();
  });

  it("should refuse an invalid key", async() => {
    expect.assertions(5);
    await checkError(dummyData.privateKey, "The key must be a public key.");
    await checkError(dummyData.weakKey, "The key size is of 2048 bits but, must be at least of 4096 bits.");
    await checkError(dummyData.expiredKey, "The key is expired.");
    await checkError(dummyData.notAKey, "Misformed armored text");
    await checkError(dummyData.existingKey, "The key is already being used, the organization recovery key must be a new one.");
  });

  it("should refuse the key if it's the same as currently used", () => {
    expect.assertions(1);
    const key = {armored_key: dummyData.viableKey};
    const expectedError = new Error("The key is the current organization recovery key, you must provide a new one.");

    const validationPromise = AccountRecoveryOrganizationPolicyService.validatePublicKey(key, key);
    return expect(validationPromise).rejects.toEqual(expectedError);
  });
});
