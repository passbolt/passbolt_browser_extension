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
 * @since         5.14.0
 */
import { enableFetchMocks } from "jest-fetch-mock";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { mockApiResponse } from "../../../../../../test/mocks/mockApiResponse";
import PasskeyApiService from "./passkeyApiService";

beforeEach(() => {
  enableFetchMocks();
  fetch.resetMocks();
  jest.clearAllMocks();
});

describe("PasskeyApiService", () => {
  let service;
  beforeEach(() => {
    service = new PasskeyApiService(defaultApiClientOptions());
  });

  it("Should have the correct resource name", () => {
    expect.assertions(1);
    expect(PasskeyApiService.RESOURCE_NAME).toEqual("/passkey");
  });

  describe("::isOrganizationEnabled", () => {
    it("GETs /passkey/organization/settings and returns the boolean flag", async () => {
      expect.assertions(3);
      fetch.doMockOnceIf(/passkey\/organization\/settings/, async (req) => {
        expect(req.method).toStrictEqual("GET");
        expect(req.url).toContain("/passkey/organization/settings");
        return mockApiResponse({ enabled: true });
      });

      const result = await service.isOrganizationEnabled();
      expect(result).toBe(true);
    });

    it("coerces a missing/false body to a boolean", async () => {
      expect.assertions(1);
      fetch.doMockOnceIf(/passkey\/organization\/settings/, async () => mockApiResponse({}));

      const result = await service.isOrganizationEnabled();
      expect(result).toBe(false);
    });
  });

  describe("::setOrganizationEnabled", () => {
    it("POSTs /passkey/organization/settings with the enabled flag and returns the boolean", async () => {
      expect.assertions(4);
      fetch.doMockOnceIf(/passkey\/organization\/settings/, async (req) => {
        expect(req.method).toStrictEqual("POST");
        expect(req.url).toContain("/passkey/organization/settings");
        const body = JSON.parse(await req.text());
        expect(body).toStrictEqual({ enabled: true });
        return mockApiResponse({ enabled: true });
      });

      const result = await service.setOrganizationEnabled(true);
      expect(result).toBe(true);
    });
  });

  describe("::findAllCredentials", () => {
    it("GETs /passkey/settings and returns the response body", async () => {
      expect.assertions(3);
      const credentials = [{ id: "cred-1" }, { id: "cred-2" }];
      fetch.doMockOnceIf(/passkey\/settings/, async (req) => {
        expect(req.method).toStrictEqual("GET");
        expect(req.url).toContain("/passkey/settings");
        return mockApiResponse({ credentials });
      });

      const body = await service.findAllCredentials();
      expect(body).toStrictEqual({ credentials });
    });
  });

  describe("::deleteCredential", () => {
    it("DELETEs /passkey/settings/{credentialId}", async () => {
      expect.assertions(2);
      const credentialId = "abc-credential-id";
      fetch.doMockOnceIf(new RegExp(`passkey/settings/${credentialId}`), async (req) => {
        expect(req.method).toStrictEqual("DELETE");
        expect(req.url).toContain(`/passkey/settings/${credentialId}`);
        return mockApiResponse({});
      });

      await service.deleteCredential(credentialId);
    });
  });

  describe("::collect / ::finishSetup / ::finishLogin", () => {
    it("collect POSTs /passkey/collect with the dto and returns the body", async () => {
      expect.assertions(3);
      fetch.doMockOnceIf(/passkey\/collect/, async (req) => {
        expect(req.method).toStrictEqual("POST");
        const body = JSON.parse(await req.text());
        expect(body).toStrictEqual({ user_id: "u-1", token: "tok", mode: "setup" });
        return mockApiResponse({ credential: { id: "cred" } });
      });

      const result = await service.collect({ user_id: "u-1", token: "tok", mode: "setup" });
      expect(result).toStrictEqual({ credential: { id: "cred" } });
    });

    it("finishSetup POSTs /passkey/setup/finish carrying the name", async () => {
      expect.assertions(3);
      fetch.doMockOnceIf(/passkey\/setup\/finish/, async (req) => {
        expect(req.url).toContain("/passkey/setup/finish");
        const body = JSON.parse(await req.text());
        expect(body.name).toStrictEqual("My laptop key");
        return mockApiResponse({ id: "stored-cred" });
      });

      const result = await service.finishSetup({ token: "tok", credential: {}, server_kit_key: "srv", name: "My laptop key" });
      expect(result).toStrictEqual({ id: "stored-cred" });
    });

    it("finishLogin POSTs /passkey/login/finish and returns the server kit half", async () => {
      expect.assertions(2);
      fetch.doMockOnceIf(/passkey\/login\/finish/, async (req) => {
        expect(req.url).toContain("/passkey/login/finish");
        return mockApiResponse({ server_kit_key: "server-half" });
      });

      const result = await service.finishLogin({ user_id: "u-1", token: "tok", credential: {} });
      expect(result).toStrictEqual({ server_kit_key: "server-half" });
    });
  });
});
