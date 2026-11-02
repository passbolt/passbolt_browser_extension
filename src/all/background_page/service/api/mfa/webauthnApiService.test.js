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
 * @since         5.17.0
 */
import { enableFetchMocks } from "jest-fetch-mock";
import { mockApiResponse, mockApiResponseError } from "../../../../../../test/mocks/mockApiResponse";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import WebauthnApiService from "./webauthnApiService";
import { defaultWebauthnCredentialCreationOptionsDto } from "../../../model/entity/mfa/webauthnCredentialCreationOptionsEntity.test.data";
import { defaultWebauthnRegistrationResponseDto } from "../../../model/entity/mfa/webauthnRegistrationResponseEntity.test.data";
import { defaultMfaWebauthnCredentialsDtos } from "../../../model/entity/mfa/mfaWebauthnCredentialsCollection.test.data";

beforeEach(() => {
  enableFetchMocks();
  jest.clearAllMocks();
});

describe("WebauthnApiService", () => {
  let service;

  beforeEach(() => {
    service = new WebauthnApiService(defaultApiClientOptions());
  });

  it("has the correct resource name", () => {
    expect.assertions(1);
    expect(WebauthnApiService.RESOURCE_NAME).toEqual("/mfa/setup/webauthn");
  });

  describe("WebauthnApiService::findAll", () => {
    it("gets the credentials and returns the body", async () => {
      expect.assertions(2);
      const dtos = defaultMfaWebauthnCredentialsDtos(2);
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\.json/, async (req) => {
        expect(req.method).toEqual("GET");
        return mockApiResponse(dtos);
      });
      const result = await service.findAll();
      expect(result.body).toEqual(dtos);
    });

    it("throws on API error", async () => {
      expect.assertions(1);
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\.json/, () =>
        mockApiResponseError(403, "MFA authentication is required."),
      );
      await expect(service.findAll()).rejects.toThrow(PassboltApiFetchError);
    });
  });

  describe("WebauthnApiService::delete", () => {
    const id = "8e3874ae-4b40-590b-968a-418f704b9d9a";

    it("deletes the credential by id", async () => {
      expect.assertions(2);
      fetch.doMockOnceIf(new RegExp(`mfa/setup/webauthn/${id}\\.json`), async (req) => {
        expect(req.method).toEqual("DELETE");
        return mockApiResponse();
      });
      await expect(service.delete(id)).resolves.toBeUndefined();
    });

    it("throws if the id is not a uuid", async () => {
      expect.assertions(1);
      await expect(service.delete("not-a-uuid")).rejects.toThrow(TypeError);
    });

    it("throws on API error", async () => {
      expect.assertions(1);
      fetch.doMockOnceIf(new RegExp(`mfa/setup/webauthn/${id}\\.json`), () =>
        mockApiResponseError(400, "The credential does not exist."),
      );
      await expect(service.delete(id)).rejects.toThrow(PassboltApiFetchError);
    });
  });

  describe("WebauthnApiService::begin", () => {
    it("posts to the begin endpoint and returns the body", async () => {
      expect.assertions(2);
      const body = { handle: "handle", credentialCreationOptions: defaultWebauthnCredentialCreationOptionsDto() };
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/begin\.json/, async (req) => {
        expect(req.method).toEqual("POST");
        return mockApiResponse(body);
      });
      const response = await service.begin();
      expect(response.body).toEqual(body);
    });

    it("throws on API error", async () => {
      expect.assertions(1);
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/begin\.json/, () => mockApiResponseError(500, "Something went wrong"));
      await expect(service.begin()).rejects.toThrow(PassboltApiFetchError);
    });
  });

  describe("WebauthnApiService::finish", () => {
    it("posts the handle, credential and name to the finish endpoint and returns the body", async () => {
      expect.assertions(3);
      const dto = { handle: "handle", credential: defaultWebauthnRegistrationResponseDto(), name: "My passkey" };
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/finish\.json/, async (req) => {
        expect(req.method).toEqual("POST");
        expect(await req.json()).toEqual(dto);
        return mockApiResponse({ verified: true });
      });
      const response = await service.finish(dto);
      expect(response.body).toEqual({ verified: true });
    });
  });
});
