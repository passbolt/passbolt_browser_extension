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
 * @since         3.10.0
 */
import "../../../../test/mocks/mockCryptoKey";
import {
  assertUuid,
  assertBase64String,
  assertPassphrase,
  assertNonExtractableSsoKey,
  assertExtractableSsoKey,
  assertValidInitialisationVector,
  assertSsoProvider,
} from "./assertions";
import {v4 as uuid} from 'uuid';
import GenerateSsoIvService from "../service/crypto/generateSsoIvService";
import {buildMockedCryptoKey} from "./assertions.test.data";
import SsoSettingsEntity from "../model/entity/sso/ssoSettingsEntity";

describe("Assertions", () => {
  describe("Assertions::assertUuid", () => {
    it("Should not throw an error if the parameter is valid", () => {
      expect.assertions(1);

      expect(() => assertUuid(uuid())).not.toThrow();
    });

    it("Should throw an error if the parameter is not valid", () => {
      const scenarios = [
        {},
        '',
        false,
        12,
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' // looks like a UUID but, it's not
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        expect(() => assertUuid(scenarios[i])).toThrow();
      }
    });
  });


  describe("Assertions::assertBase64String", () => {
    it("Should not throw an error if the parameter is valid", () => {
      expect.assertions(1);
      const base64String = "aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj14WFBXczhhQ3dyMA==";
      expect(() => assertBase64String(base64String)).not.toThrow();
    });

    it("Should throw an error if the parameter is not valid", () => {
      const scenarios = [
        {},
        '',
        false,
        12,
        'aH+'
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        expect(() => assertUuid(scenarios[i])).toThrow();
      }
    });
  });

  describe("Assertions::assertPassphrase", () => {
    it("Should not throw an error if the parameter is valid", () => {
      expect.assertions(1);

      expect(() => assertPassphrase("This is a great passphrase +/.?,;:=😁")).not.toThrow();
    });

    it("Should throw an error if the parameter is not valid", () => {
      const scenarios = [
        {},
        false,
        12,
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        expect(() => assertPassphrase(scenarios[i])).toThrow();
      }
    });
  });

  describe("Assertions::assertNonExtractableSsoKey", () => {
    it("Should not throw an error if the parameter is valid", async() => {
      expect.assertions(1);

      const ssoKey = await buildMockedCryptoKey({extractable: false});
      expect(() => assertNonExtractableSsoKey(ssoKey)).not.toThrow();
    });

    it("Should throw an error if the parameter is not valid", async() => {
      const scenarios = [
        {},
        false,
        12,
        "",
        await buildMockedCryptoKey({extractable: true}),
        await buildMockedCryptoKey({algoName: "test"}),
        await buildMockedCryptoKey({algoLength: 128}),
        await buildMockedCryptoKey({usages: []}),
        await buildMockedCryptoKey({usages: ["encrypt"]}),
        await buildMockedCryptoKey({usages: ["decrypt"]}),
        await buildMockedCryptoKey({usages: ["encrypt", "decrypt", "sign"]}),
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        expect(() => assertNonExtractableSsoKey(scenarios[i])).toThrow();
      }
    });
  });

  describe("Assertions::assertExtractableSsoKey", () => {
    it("Should not throw an error if the parameter is valid", async() => {
      expect.assertions(1);

      const ssoKey = await buildMockedCryptoKey({});
      expect(() => assertExtractableSsoKey(ssoKey)).not.toThrow();
    });

    it("Should throw an error if the parameter is not valid", async() => {
      const scenarios = [
        {},
        false,
        12,
        "",
        await buildMockedCryptoKey({extractable: false}),
        await buildMockedCryptoKey({algoName: "test"}),
        await buildMockedCryptoKey({algoLength: 128}),
        await buildMockedCryptoKey({usages: []}),
        await buildMockedCryptoKey({usages: ["encrypt"]}),
        await buildMockedCryptoKey({usages: ["decrypt"]}),
        await buildMockedCryptoKey({usages: ["encrypt", "decrypt", "sign"]}),
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        expect(() => assertExtractableSsoKey(scenarios[i])).toThrow();
      }
    });
  });

  describe("Assertions::assertValidInitialisationVector", () => {
    it("Should not throw an error if the parameter is valid", () => {
      expect.assertions(1);

      const iv = GenerateSsoIvService.generateIv();
      expect(() => assertValidInitialisationVector(iv)).not.toThrow();
    });

    it("Should throw an error if the parameter is not valid", () => {
      const scenarios = [
        {},
        false,
        12,
        "",
        GenerateSsoIvService.generateIv(0),
        GenerateSsoIvService.generateIv(11),
        GenerateSsoIvService.generateIv(16),
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        expect(() => assertValidInitialisationVector(scenarios[i])).toThrow();
      }
    });
  });

  describe("Assertions::assertSsoProvider", () => {
    it("Should not throw an error if the parameter is valid", () => {
      const validParameters = SsoSettingsEntity.AVAILABLE_PROVIDERS;
      expect.assertions(validParameters.length);

      for (let i = 0; i < validParameters.length; i++) {
        const param = validParameters[i];
        expect(() => assertSsoProvider(param)).not.toThrow();
      }
    });

    it("Should throw an error if the parameter is not valid", () => {
      const scenarios = [
        {},
        false,
        12,
        "",
        "aruze",
      ];

      expect.assertions(scenarios.length);
      for (let i = 0; i < scenarios.length; i++) {
        expect(() => assertSsoProvider(scenarios[i])).toThrow();
      }
    });
  });
});
