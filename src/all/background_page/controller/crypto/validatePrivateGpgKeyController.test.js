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
import {ValidatePrivateGpgKeyController} from "./validatePrivateGpgKeyController";

describe("ValidatePrivateGpgKeyController", () => {
  it(`Should pass if the key is valid`, async() => {
    expect.assertions(1);
    const key = pgpKeys.ada.private;
    const controller = new ValidatePrivateGpgKeyController();

    await expect(controller.exec(key, true)).resolves.toBeUndefined();
  });

  it(`Should throw an exception if the key is not formatted properly`, async() => {
    expect.assertions(1);
    const key = "Fake key";
    const controller = new ValidatePrivateGpgKeyController();

    await expect(controller.exec(key, true)).rejects.toStrictEqual(new Error("The key should be a valid armored GPG key."));
  });

  it(`Should throw an exception if the key is public`, async() => {
    expect.assertions(1);
    const key = pgpKeys.ada.public;
    const controller = new ValidatePrivateGpgKeyController();

    await expect(controller.exec(key, true)).rejects.toStrictEqual(new Error("The key should be private."));
  });

  it(`Should throw an exception if the key is revoked`, async() => {
    expect.assertions(1);
    const key = pgpKeys.revokedKey.public;
    const controller = new ValidatePrivateGpgKeyController();

    await expect(controller.exec(key, true)).rejects.toStrictEqual(new Error("The private key should not be revoked."));
  });

  it(`Should throw an exception if the key is expired`, async() => {
    const key =  pgpKeys.expired.public;
    const controller = new ValidatePrivateGpgKeyController();

    await expect(controller.exec(key, true)).rejects.toStrictEqual(new Error("The private key should not be expired."));
  });

  it(`Should throw an exception if the key has an expiration date and it requires not to have one`, async() => {
    const key =  pgpKeys.validKeyWithExpirationDateDto.private;
    const controller = new ValidatePrivateGpgKeyController();

    await expect(controller.exec(key, true)).rejects.toStrictEqual(new Error("The private key should not have an expiry date."));
  });

  it(`Should pass if the key has an expiration date and it's authorized to have one`, async() => {
    const key =  pgpKeys.validKeyWithExpirationDateDto.private;
    const controller = new ValidatePrivateGpgKeyController();

    await expect(controller.exec(key, false)).resolves.toBeUndefined();
  });
});
