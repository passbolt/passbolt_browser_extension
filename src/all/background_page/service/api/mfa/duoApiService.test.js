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
 * @since         5.10.0
 */

import { enableFetchMocks } from "jest-fetch-mock";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import DuoApiService from "./duoApiService";

beforeEach(() => {
  enableFetchMocks();
  jest.clearAllMocks();
});

describe("DuoApiService", () => {
  let service;

  beforeEach(() => {
    service = new DuoApiService(defaultApiClientOptions());
  });

  it("Should have the correct resource name", () => {
    expect.assertions(1);
    expect(DuoApiService.RESOURCE_NAME).toEqual("/mfa/setup/duo");
  });

  it("Should call the Duo prompt endpoint with a POST request", async () => {
    expect.assertions(2);

    fetch.doMockOnceIf(/mfa\/setup\/duo\/prompt/, async (req) => {
      expect(req.method).toStrictEqual("POST");
      return new Response("", {
        status: 302,
        headers: { Location: "https://api-123456af.duosecurity.com/oauth/v1/authorize" },
      });
    });

    const response = await service.promptUserForDuoSignin();

    expect(response).toBeDefined();
  });

  it("Should build the prompt URL with the redirect parameter", async () => {
    expect.assertions(1);

    fetch.doMockOnceIf(/mfa\/setup\/duo\/prompt/, async (req) => {
      expect(req.url).toContain("/prompt?redirect=/app/settings/mfa/duo");
      return new Response("", { status: 302 });
    });

    await service.promptUserForDuoSignin();
  });
});
