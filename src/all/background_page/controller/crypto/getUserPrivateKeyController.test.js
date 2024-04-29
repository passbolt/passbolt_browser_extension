/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.3.0
 */
import {enableFetchMocks} from "jest-fetch-mock";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import MockExtension from "../../../../../test/mocks/mockExtension";
import Keyring from '../../model/keyring';
import GetGpgKeyInfoService from "../../service/crypto/getGpgKeyInfoService";
import {v4 as uuidv4} from "uuid";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import GetUserPrivateKeyController from "./getUserPrivateKeyController";
import GpgKeyError from "../../error/GpgKeyError";
import AccountEntity from "../../model/entity/account/accountEntity";
import {adminAccountDto} from "../../model/entity/account/accountEntity.test.data";

const keyring = new Keyring();
jest.mock("../../service/passphrase/getPassphraseService");

beforeAll(() => {
  enableFetchMocks();
});

describe("GetUserPrivateKeyController", () => {
  const account = new AccountEntity(adminAccountDto());
  it(`Should return the user's armored encrypted private key`, async() => {
    expect.assertions(1);
    const userId = uuidv4();
    await MockExtension.withConfiguredAccount();
    await keyring.importPrivate(pgpKeys.ada.private, userId);

    const controller = new GetUserPrivateKeyController(null, null, account);
    controller.getPassphraseService.requestPassphrase.mockResolvedValue(pgpKeys.ada.passphrase);
    const armoredPrivateKey = await controller.exec();

    const adaPrivateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private);
    const adaKeyInfo = await GetGpgKeyInfoService.getKeyInfo(adaPrivateKey);

    const returnedKey = await OpenpgpAssertion.readKeyOrFail(armoredPrivateKey);
    const returnedKeyInfo = await GetGpgKeyInfoService.getKeyInfo(returnedKey);

    expect(returnedKeyInfo.toDto()).toStrictEqual(adaKeyInfo.toDto());
  });

  it(`Should throw an exception if the private key does not exist`, async() => {
    expect.assertions(1);
    const controller = new GetUserPrivateKeyController(null, null, account);

    try {
      await controller.exec();
    } catch (error) {
      expect(error).toStrictEqual(new GpgKeyError('Private key not found.'));
    }
  });
});
