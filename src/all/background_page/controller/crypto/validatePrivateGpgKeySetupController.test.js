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
import each from "jest-each";
import {pgpKeys} from '../../../../../test/fixtures/pgpKeys/keys';
import ValidatePrivateGpgKeySetupController from './validatePrivateGpgKeySetupController';
import GetGpgKeyInfoService from "../../service/crypto/getGpgKeyInfoService";

describe("ValidatePrivateGpgKeySetupController", () => {
  each([
    {scenario: "rsa_3072", key: pgpKeys.rsa_3072.private},
    {scenario: "rsa_4096", key: pgpKeys.rsa_4096.private},
    {scenario: "eddsa_ed25519", key: pgpKeys.eddsa_ed25519.private},
    {scenario: "ecc_p256", key: pgpKeys.ecdsa_p256.private},
    {scenario: "ecc_p384", key: pgpKeys.ecdsa_p384.private},
    {scenario: "ecc_p521", key: pgpKeys.ecdsa_p521.private},
    {scenario: "ecc_secp256k1", key: pgpKeys.ecdsa_secp256k1.private},
    {scenario: "ecc_brainpoolp256r1", key: pgpKeys.ecdsa_brainpoolp256r1.private},
    {scenario: "ecc_brainpoolp384r1", key: pgpKeys.ecdsa_brainpoolp384r1.private},
    {scenario: "ecc_brainpoolp512r1", key: pgpKeys.ecdsa_brainpoolp512r1.private},
  ]).describe("Should pass if a supported key given.", props => {
    it(`should accept: ${props.scenario}`, async() => {
      expect.assertions(1);
      const controller = new ValidatePrivateGpgKeySetupController();
      await expect(controller.exec(props.key)).resolves.toBeUndefined();
    });
  });

  each([
    {scenario: "dsa_3072", key: pgpKeys.dsa_3072.private},
  ]).describe("Should throw if the key uses an unsupported algorithm.", props => {
    it(`should reject: ${props.scenario}`, async() => {
      expect.assertions(1);
      const controller = new ValidatePrivateGpgKeySetupController();
      await expect(controller.exec(props.key)).rejects.toStrictEqual(new Error("The private key should use a supported algorithm: RSA, ECDSA OR EDDSA."));
    });
  });

  it("Should throw an exception if the key is not formatted properly", async() => {
    expect.assertions(1);
    const key = "Fake key";
    const controller = new ValidatePrivateGpgKeySetupController();
    await expect(controller.exec(key)).rejects.toStrictEqual(new Error("The key should be a valid openpgp armored key string."));
  });

  it("Should throw an exception if the key is not a valid openpgp key", async() => {
    expect.assertions(1);
    const key = pgpKeys.invalidKeyWithoutChecksum.private;
    const controller = new ValidatePrivateGpgKeySetupController();
    await expect(controller.exec(key)).rejects.toStrictEqual(new Error("The private key should be a valid openpgp key."));
  });

  it("Should throw an exception if the key is public", async() => {
    expect.assertions(1);
    const key = pgpKeys.ada.public;
    const controller = new ValidatePrivateGpgKeySetupController();
    await expect(controller.exec(key)).rejects.toStrictEqual(new Error("The key should be a valid openpgp private key."));
  });

  it("Should throw an exception if the key is revoked", async() => {
    expect.assertions(1);
    const key = pgpKeys.revokedKey.private;
    const controller = new ValidatePrivateGpgKeySetupController();
    await expect(controller.exec(key)).rejects.toStrictEqual(new Error("The private key should not be revoked."));
  });

  it("Should throw an exception if the key is expired", async() => {
    expect.assertions(1);
    const key =  pgpKeys.expired.private;
    const controller = new ValidatePrivateGpgKeySetupController();
    await expect(controller.exec(key)).rejects.toStrictEqual(new Error("The private key should not be expired."));
  });

  it("Should throw an exception if the key has an expiration date", async() => {
    expect.assertions(1);
    const key =  pgpKeys.validKeyWithExpirationDateDto.private;
    const controller = new ValidatePrivateGpgKeySetupController();
    await expect(controller.exec(key)).rejects.toStrictEqual(new Error("The private key should not have an expiry date."));
  });

  it("Should throw if the private key is already decrypted", async() => {
    expect.assertions(1);
    const key =  pgpKeys.ada.private_decrypted;
    const controller = new ValidatePrivateGpgKeySetupController();
    await expect(controller.exec(key)).rejects.toStrictEqual(new Error("The private key should be encrypted."));
  });

  each([
    {scenario: "rsa_1024", key: pgpKeys.rsa_1024.private},
    {scenario: "rsa_2048", key: pgpKeys.rsa_2048.private},
  ]).describe("Should throw if the private key is a too weak RSA key.", props => {
    it(`should reject: ${props.scenario}`, async() => {
      expect.assertions(1);
      const controller = new ValidatePrivateGpgKeySetupController();
      await expect(controller.exec(props.key)).rejects.toStrictEqual(new Error("An RSA key should have a length of 3072 bits minimum."));
    });
  });

  it(`Should throw if the private key is not an RSA and has no curve associated`, async() => {
    expect.assertions(1);
    const keyInfo = {
      revoked: false,
      isExpired: false,
      expires: "Infinity",
      private: true,
      algorithm: "EdDSA",
      curve: null,
      isValid: true
    };
    jest.spyOn(GetGpgKeyInfoService, "getKeyInfo").mockImplementation(() => keyInfo);
    const dummyKey = pgpKeys.ada.private;
    const controller = new ValidatePrivateGpgKeySetupController();
    await expect(controller.exec(dummyKey)).rejects.toStrictEqual(new Error("The private key should use a supported algorithm: RSA, ECDSA OR EDDSA."));
  });

  it("Should throw if the private key is not an ECC with an unsupported curve", async() => {
    expect.assertions(1);
    const keyInfo = {
      revoked: false,
      isExpired: false,
      expires: "Infinity",
      private: true,
      algorithm: "EdDSA",
      curve: "custom-curve",
      isValid: true
    };
    jest.spyOn(GetGpgKeyInfoService, "getKeyInfo").mockImplementation(() => keyInfo);
    const dummyKey = pgpKeys.ada.private;
    const controller = new ValidatePrivateGpgKeySetupController();
    await expect(controller.exec(dummyKey)).rejects.toStrictEqual(new Error("An ECC key should be based on a supported curve."));
  });
});
