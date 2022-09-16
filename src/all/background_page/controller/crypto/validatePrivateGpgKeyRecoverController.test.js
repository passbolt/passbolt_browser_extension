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
import ValidatePrivateGpgKeyRecoverController from "./validatePrivateGpgKeyRecoverController";

describe("ValidatePrivateGpgKeyRecoverController", () => {
  it(`Should pass if the key is valid`, async() => {
    expect.assertions(1);
    const key = pgpKeys.ada.private;
    const controller = new ValidatePrivateGpgKeyRecoverController();

    await expect(controller.exec(key)).resolves.toBeUndefined();
  });

  it(`Should throw an exception if the key is not formatted properly`, async() => {
    expect.assertions(1);
    const key = "Fake key";
    const controller = new ValidatePrivateGpgKeyRecoverController();

    await expect(controller.exec(key)).rejects.toStrictEqual(new Error("The key should be a valid openpgp armored key string."));
  });

  it(`Should throw an exception if the key is public`, async() => {
    expect.assertions(1);
    const key = pgpKeys.ada.public;
    const controller = new ValidatePrivateGpgKeyRecoverController();

    await expect(controller.exec(key)).rejects.toStrictEqual(new Error("The key should be a valid openpgp private key."));
  });

  it(`Should throw an exception if the key is revoked`, async() => {
    expect.assertions(1);
    const key = pgpKeys.revokedKey.private;
    const controller = new ValidatePrivateGpgKeyRecoverController();

    await expect(controller.exec(key)).rejects.toStrictEqual(new Error("The private key should not be revoked."));
  });

  it(`Should throw an exception if the key is expired`, async() => {
    const key =  pgpKeys.expired.private;
    const controller = new ValidatePrivateGpgKeyRecoverController();

    await expect(controller.exec(key)).rejects.toStrictEqual(new Error("The private key should not be expired."));
  });

  it(`Should pass if the key has an expiration date`, async() => {
    const key =  pgpKeys.validKeyWithExpirationDateDto.private;
    const controller = new ValidatePrivateGpgKeyRecoverController();

    await expect(controller.exec(key)).resolves.toBeUndefined();
  });

  it(`Should throw if the private key is already decrypted`, async() => {
    const key =  pgpKeys.ada.private_decrypted;
    const controller = new ValidatePrivateGpgKeyRecoverController();

    await expect(controller.exec(key)).rejects.toStrictEqual(new Error("The private key should be encrypted."));
  });
});
