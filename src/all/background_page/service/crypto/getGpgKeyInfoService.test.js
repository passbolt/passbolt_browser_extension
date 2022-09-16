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

import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import ExternalGpgKeyEntity from "./../../model/entity/gpgkey/external/externalGpgKeyEntity";
import GetGpgKeyInfoService from "./getGpgKeyInfoService";
import ExternalGpgKeyCollection from "../../model/entity/gpgkey/external/externalGpgKeyCollection";

const {
  validKeyDto,
  expiredKeyDto,
  revokedKeyDto,
  validKeyWithExpirationDateDto,
  eddsaCurveKeyDto,
  ecc_p256KeyDto,
  ecc_p384KeyDto,
  ecc_p521KeyDto,
  ecc_curve25519KeyDto,
  ecc_secp256k1KeyDto,
  ecc_brainpoolp256r1KeyDto,
  ecc_brainpoolp384r1KeyDto,
  ecc_brainpoolp512r1KeyDto,
  invalidKeyDto
} = require('./getGpgKeyInfoService.test.data');
const {pgpKeys} = require("../../../../../test/fixtures/pgpKeys/keys");


describe("GpgKeyInfo service", () => {
  it(`should provide the right information given a key from a compatible type`, async() => {
    const dto = validKeyDto();
    const key = await OpenpgpAssertion.readKeyOrFail(dto.armored_key);

    //avoid issues where parsing a key actually change the resulting armor (embed data are still the same though)
    expect.assertions(1);
    const keyInfo = await GetGpgKeyInfoService.getKeyInfo(key);
    const receivedData = keyInfo.toDto();
    delete dto.armored_key;
    delete receivedData.armored_key;
    expect(receivedData).toEqual(dto);
  });

  it("should throw an exception if the parameter type is incorrect", async() => {
    const dto = validKeyDto();
    const wronglyTypedData = [
      42, true,
      {armored_key: dto.armored_key},
      {armoredKey: dto.armored_key},
      {key: dto.armored_key},
      new ExternalGpgKeyCollection([{armored_key: dto.armored_key}]),
      new ExternalGpgKeyEntity({armored_key: dto.armored_key}),
      pgpKeys.ada.public
    ];

    expect.assertions(wronglyTypedData.length);

    for (let i = 0; i < wronglyTypedData.length; i++) {
      try {
        await GetGpgKeyInfoService.getKeyInfo(wronglyTypedData[i]);
      } catch (e) {
        expect(e).toStrictEqual(new Error("The key should be a valid openpgp key."));
      }
    }
  });

  it("should throw an exception if the key is not properly formatted", async() => {
    expect.assertions(1);
    try {
      await GetGpgKeyInfoService.getKeyInfo(":D");
    } catch (e) {
      expect(e).toStrictEqual(new Error("The key should be a valid openpgp key."));
    }
  });

  it("should give the information of a key that will expire", async() => {
    expect.assertions(1);
    const dto = validKeyWithExpirationDateDto();
    const armoredKey = await OpenpgpAssertion.readKeyOrFail(dto.armored_key);
    const keyInfo = await GetGpgKeyInfoService.getKeyInfo(armoredKey);
    const keyInfoDto = keyInfo.toDto();
    delete dto.armored_key;
    delete keyInfoDto.armored_key;
    expect(keyInfoDto).toEqual(dto);
  });

  it("should give the information of a key that is expired", async() => {
    expect.assertions(1);
    const dto = expiredKeyDto();
    const key = await OpenpgpAssertion.readKeyOrFail(dto.armored_key);
    const keyInfo = await GetGpgKeyInfoService.getKeyInfo(key);
    const keyInfoDto = keyInfo.toDto();
    delete dto.armored_key;
    delete keyInfoDto.armored_key;
    expect(keyInfoDto).toEqual(dto);
  });

  it("should give the information of a key that is revoked", async() => {
    expect.assertions(1);
    const dto = revokedKeyDto();
    const key = await OpenpgpAssertion.readKeyOrFail(dto.armored_key);
    const keyInfo = await GetGpgKeyInfoService.getKeyInfo(key);
    const keyInfoDto = keyInfo.toDto();
    delete dto.armored_key;
    delete keyInfoDto.armored_key;
    expect(keyInfoDto).toEqual(dto);
  });

  it("should give the information of a key that is non RSA", async() => {
    const scenarios = [
      eddsaCurveKeyDto(),
      ecc_p256KeyDto(),
      ecc_p384KeyDto(),
      ecc_p521KeyDto(),
      ecc_curve25519KeyDto(),
      ecc_secp256k1KeyDto(),
      ecc_brainpoolp256r1KeyDto(),
      ecc_brainpoolp384r1KeyDto(),
      ecc_brainpoolp512r1KeyDto(),
    ];
    expect.assertions(scenarios.length);

    for (let i = 0; i < scenarios.length; i++) {
      const dto = scenarios[i];
      const key = await OpenpgpAssertion.readKeyOrFail(dto.armored_key);
      const keyInfo = await GetGpgKeyInfoService.getKeyInfo(key);
      const keyInfoDto = keyInfo.toDto();

      //Remove the armored_key as OpenpgpJS produced different armors than gpg cli.
      delete keyInfoDto.armored_key;
      delete dto.armored_key;
      expect(keyInfoDto).toEqual(dto);
    }
  });

  it("should accept keys with a null expiry date", async() => {
    const dto = invalidKeyDto();
    const key = await OpenpgpAssertion.readKeyOrFail(dto.armored_key);
    const keyInfo = await GetGpgKeyInfoService.getKeyInfo(key);
    const keyInfoDto = keyInfo.toDto();
    //Remove the armored_key as OpenpgpJS produced different armors than gpg cli.
    delete keyInfoDto.armored_key;
    delete dto.armored_key;
    expect(keyInfoDto).toEqual(dto);
  });
});
