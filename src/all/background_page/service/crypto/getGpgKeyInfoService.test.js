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

const {GetGpgKeyInfoService} = require("./getGpgKeyInfoService");
const {ExternalGpgKeyEntity} = require('./../../model/entity/gpgkey/external/externalGpgKeyEntity');
const {GpgKeyError} = require("../../error/GpgKeyError");
const {ExternalGpgKeyCollection} = require("../../model/entity/gpgkey/external/externalGpgKeyCollection");
const {keyInfoDtos} = require('./getGpgKeyInfoService.test.data');

describe("GpgKeyInfo service", () => {
  it(`should provide the right information given a key from a compatible type'`, async() => {
    const dto = keyInfoDtos.validKeyDto;
    const availableFormatData = [
      dto.armored_key,
      new ExternalGpgKeyEntity(dto),
      (await openpgp.key.readArmored(dto.armored_key)).keys[0],
    ];

    expect.assertions(availableFormatData.length);

    for (let i = 0; i < availableFormatData.length; i++) {
      const keyInfo = await GetGpgKeyInfoService.getKeyInfo(availableFormatData[i]);
      expect(keyInfo.toDto()).toEqual(dto);
    }
  });

  it("should throw an exception if the parameter type is incorrect", async() => {
    const dto = keyInfoDtos.validKeyDto;
    const wronglyTypedData = [
      42, true,
      {armored_key: dto.armored_key},
      {armoredKey: dto.armored_key},
      {key: dto.armored_key},
      new ExternalGpgKeyCollection([{armored_key: dto.armored_key}])
    ];

    expect.assertions(wronglyTypedData.length);

    for (let i = 0; i < wronglyTypedData.length; i++) {
      try {
        await GetGpgKeyInfoService.getKeyInfo(wronglyTypedData[i]);
      } catch (e) {
        expect(e).toEqual(new GpgKeyError("Cannot parse key from the given data"));
      }
    }
  });

  it("should throw an exception if the key is not properly formatted", async() => {
    const goodTypeWithWrongData = [
      ":D",
      new ExternalGpgKeyEntity({armored_key: ":/"})
    ];

    expect.assertions(goodTypeWithWrongData.length);

    for (let i = 0; i < goodTypeWithWrongData.length; i++) {
      try {
        await GetGpgKeyInfoService.getKeyInfo(goodTypeWithWrongData[i]);
      } catch (e) {
        expect(e).toEqual(new GpgKeyError("Misformed armored text"));
      }
    }
  });

  it("should give the information of a key that will expire", async() => {
    const dto = keyInfoDtos.validKeyWithExpirationDateDto;
    expect.assertions(1);
    const keyInfo = await GetGpgKeyInfoService.getKeyInfo(dto.armored_key);
    expect(keyInfo.toDto()).toEqual(dto);
  });

  it("should give the information of a key that is expired", async() => {
    const dto = keyInfoDtos.expiredKeyDto;
    expect.assertions(1);
    const keyInfo = await GetGpgKeyInfoService.getKeyInfo(dto.armored_key);
    expect(keyInfo.toDto()).toEqual(dto);
  });

  it("should give the information of a key that is revoked", async() => {
    const dto = keyInfoDtos.revokedKeyDto;
    expect.assertions(1);
    const keyInfo = await GetGpgKeyInfoService.getKeyInfo(dto.armored_key);
    expect(keyInfo.toDto()).toEqual(dto);
  });
});
