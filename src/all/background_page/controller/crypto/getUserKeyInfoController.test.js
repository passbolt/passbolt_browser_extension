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
import {enableFetchMocks} from "jest-fetch-mock";
import GetUserKeyInfoController from "./getUserKeyInfoController";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import Keyring from '../../model/keyring';
import GetGpgKeyInfoService from "../../service/crypto/getGpgKeyInfoService";
import {v4 as uuidv4} from "uuid";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

const keyring = new Keyring();

beforeAll(() => {
  enableFetchMocks();
});

describe("GetUserKeyInfocontroller", () => {
  it(`Should return user key info from an existing userId`, async() => {
    expect.assertions(1);
    const userId = uuidv4();
    await MockExtension.withConfiguredAccount();
    await keyring.importPublic(pgpKeys.ada.public, userId);

    const controller = new GetUserKeyInfoController();
    const keyInfo = await controller.exec(userId);

    const adaPublicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
    const adaKeyInfo = await GetGpgKeyInfoService.getKeyInfo(adaPublicKey);
    expect(keyInfo.toDto()).toStrictEqual(adaKeyInfo.toDto());
  });

  it(`Should throw an exception if the given userId doesn't exist`, async() => {
    expect.assertions(2);
    await MockExtension.withConfiguredAccount();
    const controller = new GetUserKeyInfoController();

    fetch.doMockOnce(async req => {
      expect(req.url).toEqual(expect.stringContaining("gpgkeys.json?api-version=v2"));
      return await mockApiResponse({});
    });

    try {
      await controller.exec("non existing user id");
    } catch (error) {
      expect(error).toStrictEqual(new Error('User key not found'));
    }
  });
});
