/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com"k)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.11.0
 */


import GenerateMetadataKeyService from "./generateMetadataKeyService";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import GetGpgKeyInfoService from "../crypto/getGpgKeyInfoService";
import VerifyGpgKeyService from "../crypto/verifyGpgKeyService";

describe("GenerateMetadataKeyService", () => {
  let account, service;

  beforeEach(() => {
    account = new AccountEntity(defaultAccountDto());
    service = new GenerateMetadataKeyService(account);
  });

  it("generates a metadata key", async() => {
    expect.assertions(17);

    const userKey = await OpenpgpAssertion.readKeyOrFail(account.userPrivateArmoredKey);
    const keyPair = await service.generateKey("ada@passbolt.com");

    const publicKey = await OpenpgpAssertion.readKeyOrFail(keyPair.publicKey.armoredKey);
    const publicKeyInfo = await GetGpgKeyInfoService.getKeyInfo(publicKey);
    expect(publicKeyInfo.algorithm).toBe("eddsa");
    expect(publicKeyInfo.userIds[0].name).toEqual("Passbolt Metadata Key");
    expect(/^no-reply\+[a-f0-9\-]{36}@passbolt\.com$/.test(publicKeyInfo.userIds[0].email)).toBe(true);
    expect(publicKeyInfo.length).toBe(256);
    expect(publicKeyInfo.private).toBe(false);
    expect(publicKeyInfo.revoked).toBe(false);
    expect(publicKeyInfo.expires).toBe("Infinity");
    expect((new Date(Date.parse(publicKeyInfo.created))).toISOString()).toEqual(publicKeyInfo.created);
    await expect(VerifyGpgKeyService.verify(publicKey, [userKey])).resolves.toBe(true);

    const privateKey = await OpenpgpAssertion.readKeyOrFail(keyPair.privateKey.armoredKey);
    const privateKeyInfo = await GetGpgKeyInfoService.getKeyInfo(privateKey);
    expect(privateKeyInfo.algorithm).toBe("eddsa");
    expect(privateKeyInfo.userIds[0].name).toEqual("Passbolt Metadata Key");
    expect(/^no-reply\+[a-f0-9\-]{36}@passbolt\.com$/.test(privateKeyInfo.userIds[0].email)).toBe(true);
    expect(privateKeyInfo.length).toBe(256);
    expect(privateKeyInfo.private).toBe(true);
    expect(privateKeyInfo.revoked).toBe(false);
    expect(privateKeyInfo.expires).toBe("Infinity");
    expect((new Date(Date.parse(privateKeyInfo.created))).toISOString()).toEqual(privateKeyInfo.created);
  }, 50 * 1000);

  it("throws if the passphrase is not a string", async() => {
    expect.assertions(1);
    await expect(() => service.generateKey(42)).rejects.toThrow("The given parameter is not a valid string");
  });

  it("throws if the passphrase is not valid", async() => {
    expect.assertions(1);
    await expect(() => service.generateKey("invalid-passphrase")).rejects.toThrow("This is not a valid passphrase");
  });
});
