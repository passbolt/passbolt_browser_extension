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
 * @since         4.5.0
 */
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import TotpEntity from "./totpEntity";
import each from "jest-each";
import {defaultTotpDto} from "./totpDto.test.data";
import ExternalResourceEntity from "../resource/external/externalResourceEntity";
import {lowerCaseAlgorithmSetupTotpData} from "../mfa/mfaSetupTotpEntity.test.data";

describe("Totp entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(TotpEntity.ENTITY_NAME, TotpEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    expect.assertions(1);
    const dto = defaultTotpDto();
    const entity = new TotpEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("Sanitize DTO should not contains special and space characters", () => {
    expect.assertions(1);
    const dto = TotpEntity.sanitizeDto(defaultTotpDto({secret_key: " 572H +KBKéàùêB=_%$ "}));
    expect(dto.secret_key).toEqual("572HKBKB");
  });

  it("Sanitize valid DTO should remain the same", () => {
    expect.assertions(1);
    const dto = TotpEntity.sanitizeDto(defaultTotpDto());
    expect(dto.secret_key).toEqual(defaultTotpDto().secret_key);
  });

  it("CreateTotpFromUrl should work with lowercase algorithm", () => {
    const otpUrlData = lowerCaseAlgorithmSetupTotpData();
    const url = new URL(otpUrlData.otpProvisioningUri);
    expect(() => TotpEntity.createTotpFromUrl(url)).not.toThrow();
  });

  each([
    {scenario: 'empty dto', dto: {}},
    {scenario: 'secret key not base32', dto: defaultTotpDto({secret_key: " 871H KBKB "})},
    {scenario: 'digits is not valid', dto: defaultTotpDto({digits: 10})},
    {scenario: 'period is not valid', dto: defaultTotpDto({period: 0})},
    {scenario: 'algorithm is not valid', dto: defaultTotpDto({algorithm: "AAA"})},
  ]).describe("constructor returns validation error if dto is not valid", test => {
    it(`Should not validate: ${test.scenario}`, async() => {
      expect.assertions(1);
      const t = () => { new TotpEntity(test.dto); };
      expect(t).toThrow(EntityValidationError);
    });
  });

  it("constructor works if valid kdbx windows is provided", () => {
    expect.assertions(1);
    const fields = new Map();
    fields.set("TimeOtp-Secret-Base32", {getText: () => "OFL3VF3OU4BZP45D4ZME6KTF654JRSSO4Q2EO6FJFGPKHRHYSVJA"});
    fields.set("TimeOtp-Algorithm", "HMAC-SHA-256");
    fields.set("TimeOtp-Length", "7");
    fields.set("TimeOtp-Period", "60");
    const entity = TotpEntity.createTotpFromKdbxWindows(fields);
    const dto = {
      secret_key: "OFL3VF3OU4BZP45D4ZME6KTF654JRSSO4Q2EO6FJFGPKHRHYSVJA",
      period: 60,
      digits: 7,
      algorithm: "SHA256"
    };
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if valid url is provided", () => {
    expect.assertions(1);
    const url = new URL('otpauth://totp/pro.passbolt.local:admin@passbolt.com?issuer=pro.passbolt.local&secret=OFL3VF3OU4BZP45D4ZME6KTF654JRSSO4Q2EO6FJFGPKHRHYSVJA');
    const entity = TotpEntity.createTotpFromUrl(url);
    const dto = {
      secret_key: "OFL3VF3OU4BZP45D4ZME6KTF654JRSSO4Q2EO6FJFGPKHRHYSVJA",
      period: 30,
      digits: 6,
      algorithm: "SHA1"
    };
    expect(entity.toDto()).toEqual(dto);
  });

  it("should return a valid url from TOTP", () => {
    expect.assertions(1);
    const urlExpected = new URL('otpauth://totp/pro.passbolt.local%3Aadmin%40passbolt.com?secret=DAV3DS4ERAAF5QGH&issuer=pro.passbolt.local&algorithm=SHA1&digits=6&period=30');

    const dto = defaultTotpDto();
    const entity = new TotpEntity(dto);
    const externalResourceDto = {
      "name": "pro.passbolt.local",
      "username": "admin@passbolt.com",
      "uri": "pro.passbolt.local",
    };
    const externalResourceEntity = new ExternalResourceEntity(externalResourceDto);
    const url = entity.createUrlFromResource(externalResourceEntity);
    expect(url.href).toStrictEqual(urlExpected.href);
  });
});
