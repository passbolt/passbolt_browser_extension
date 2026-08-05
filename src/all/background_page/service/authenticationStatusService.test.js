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
 * @since         4.7.0
 */
import AuthenticationStatusService from "./authenticationStatusService";
import { enableFetchMocks } from "jest-fetch-mock";
import { mockApiResponse, mockApiResponseError, mockApiRedirectResponse } from "../../../../test/mocks/mockApiResponse";
import NotFoundError from "../error/notFoundError";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import MfaAuthenticationRequiredError from "../error/mfaAuthenticationRequiredError";
import PassboltBadResponseError from "../error/passboltBadResponseError";

beforeAll(() => {
  enableFetchMocks();
});

beforeEach(async () => {
  jest.clearAllMocks();
});

describe("AuthenticationStatusService::isAuthenticated", () => {
  function mockIsAuthenticated(callback) {
    fetch.doMockOnceIf(/auth\/is-authenticated\.json/, callback);
  }

  it("should return true if the user is fully authenticated", async () => {
    expect.assertions(1);
    mockIsAuthenticated(() => mockApiResponse({}));
    const authenticationStatusService = new AuthenticationStatusService(defaultApiClientOptions());
    await expect(authenticationStatusService.isAuthenticated()).resolves.toStrictEqual(true);
  });

  it("should return false if the user is not signed in and doesn't required MFA", async () => {
    expect.assertions(1);
    mockIsAuthenticated(() => mockApiResponseError(403, "User is not signed in"));
    const authenticationStatusService = new AuthenticationStatusService(defaultApiClientOptions());
    await expect(authenticationStatusService.isAuthenticated()).resolves.toStrictEqual(false);
  });

  it("should throw an Error if the endpoint is not found", async () => {
    expect.assertions(1);
    mockIsAuthenticated(() => mockApiResponseError(404, "Endpoint is not found"));
    const authenticationStatusService = new AuthenticationStatusService(defaultApiClientOptions());
    await expect(authenticationStatusService.isAuthenticated()).rejects.toThrow(NotFoundError);
  });

  it("should throw an MfaAuthenticationRequiredError if the user miss the Mfa authentication", async () => {
    expect.assertions(1);
    mockIsAuthenticated(() => mockApiRedirectResponse("/mfa/verify/error.json"));
    const authenticationStatusService = new AuthenticationStatusService(defaultApiClientOptions());
    await expect(authenticationStatusService.isAuthenticated()).rejects.toThrow(MfaAuthenticationRequiredError);
  });

  it("should throw a PassboltBadResponseError if the response can't be parsed (e.g HTML error page, ...)", async () => {
    expect.assertions(1);

    mockIsAuthenticated(async () => "<html><body>502 Bad Gateway</body></html>");
    const authenticationStatusService = new AuthenticationStatusService(defaultApiClientOptions());

    await expect(authenticationStatusService.isAuthenticated()).rejects.toThrow(PassboltBadResponseError);
  });
});
