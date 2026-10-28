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

import ParseSetupUrlService from "./parseSetupUrlService";

describe("ParseSetupUrlService", () => {
  describe("ParseSetupUrlService:parse", () => {
    describe.each([
      {
        scenario: "http",
        url: "http://test.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "http://test.com",
      },
      {
        scenario: "https",
        url: "https://test.com/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "https://test.com",
      },
      {
        scenario: "Subdomain",
        url: "https://cloud.test.com/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "https://cloud.test.com",
      },
      {
        scenario: "Non tld",
        url: "https://passbolt/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "https://passbolt",
      },
      {
        scenario: "Port",
        url: "https://test.com:4443/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "https://test.com:4443",
      },
      {
        scenario: "IP v4",
        url: "https://127.0.0.1/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "https://127.0.0.1",
      },
      {
        scenario: "IP v4 with port",
        url: "https://127.0.0.1:4443/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "https://127.0.0.1:4443",
      },
      {
        scenario: "IP v6",
        url: "https://[0:0:0:0:0:0:0:1]/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "https://[0:0:0:0:0:0:0:1]",
      },
      {
        scenario: "IP v6 with port",
        url: "https://[0:0:0:0:0:0:0:1]:4443/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "https://[0:0:0:0:0:0:0:1]:4443",
      },
      {
        scenario: "Subfolder",
        url: "https://test.com/subfolder/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "https://test.com/subfolder",
      },
      {
        scenario: "Subfolder with port",
        url: "http://test.com:4443/subfolder/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "http://test.com:4443/subfolder",
      },
      {
        scenario: "Trailing /",
        url: "https://test.com//setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "https://test.com",
      },
      {
        scenario: "Subfolder with trailing /",
        url: "https://test.com/subfolder//setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "https://test.com/subfolder",
      },
      {
        scenario: "Fragment looking like a setup path",
        url: "https://test.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0#/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "https://test.com",
      },
      {
        scenario: "Subfolder and fragment looking like a setup path",
        url: "https://test.com/subfolder/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0#/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "https://test.com/subfolder",
      },
      {
        scenario: "Query string looking like a setup path",
        url: "https://test.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0?redirect=/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
        domain: "https://test.com",
      },
      {
        scenario: "Query string and fragment",
        url: "https://test.com/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0?first-install=1#fragment",
        domain: "https://test.com",
      },
      {
        scenario: "IP v6 with port, subfolder, query string and fragment",
        url: "http://[0:0:0:0:0:0:0:1]:4443/subfolder/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0?first-install=1#fragment",
        domain: "http://[0:0:0:0:0:0:0:1]:4443/subfolder",
      },
    ])("should parse", (_props) => {
      it(`should parse: ${_props.scenario}`, () => {
        const parseResult = ParseSetupUrlService.parse(_props.url);

        expect.assertions(3);
        expect(parseResult.domain).toBe(_props.domain);
        expect(parseResult.user_id).toBe("571bec7e-6cce-451d-b53a-f8c93e147228");
        expect(parseResult.authentication_token_token).toBe("5ea0fc9c-b180-4873-8e00-9457862e43e0");
      });
    });

    describe.each([
      {
        scenario: "Wrong path",
        url: "https://test.com/setup/test/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "Wrong path with subfolder and fragment looking like a setup path",
        url: "https://test.com/subfolder/setup/test/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0#/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "Wrong path with query string looking like a setup path",
        url: "https://test.com/setup/recover/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0?redirect=/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "No token",
        url: "https://test.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228",
      },
      {
        scenario: "No user id",
        url: "https://test.com/setup/install",
      },
      {
        scenario: "No scheme",
        url: "test.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "ftp scheme",
        url: "ftp://test.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "ftps scheme",
        url: "ftps://test.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "ssh scheme",
        url: "ssh://test.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "file scheme",
        url: "file://test.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "Invalid scheme with IP v6, port and subfolder",
        url: "ftp://[0:0:0:0:0:0:0:1]:4443/subfolder/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
    ])("should not parse", (_props) => {
      it(`should not parse: ${_props.scenario}`, () => {
        expect.assertions(1);
        expect(() => ParseSetupUrlService.parse(_props.url)).toThrow(
          "Cannot parse setup url. The url does not match the pattern.",
        );
      });
    });

    describe.each([
      {
        scenario: "Setup path in query string",
        url: "https://test.com/?next=/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "Setup url in query string",
        url: "https://test.com/page?redirect=https://other.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "Setup url in query string with subfolder",
        url: "https://test.com/subfolder?redirect=https://other.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "Setup path in fragment",
        url: "https://test.com/#/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "Setup url in fragment",
        url: "https://test.com/page#https://other.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
    ])("should not parse setup path outside of the url path", (_props) => {
      it(`should not parse: ${_props.scenario}`, () => {
        expect.assertions(1);
        expect(() => ParseSetupUrlService.parse(_props.url)).toThrow(
          "Cannot parse setup url. The url does not match the pattern.",
        );
      });
    });

    describe.each([
      {
        scenario: "User and password",
        url: "https://user:password@test.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "User only",
        url: "https://user@test.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "Host spoofed as user",
        url: "https://test.com@attacker.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "Host and port spoofed as user",
        url: "https://test.com:443@attacker.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "User and password with IP v4 and port",
        url: "https://user:password@127.0.0.1:4443/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "User and password with IP v6, port and subfolder",
        url: "https://user:password@[0:0:0:0:0:0:0:1]:4443/subfolder/setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
    ])("should not parse url with credentials", (_props) => {
      it(`should not parse: ${_props.scenario}`, () => {
        expect.assertions(1);
        expect(() => ParseSetupUrlService.parse(_props.url)).toThrow(
          "Cannot parse setup url. The url does not match the pattern.",
        );
      });
    });

    describe.each([
      {
        scenario: "Plain script",
        url: "javascript:alert(1)",
      },
      {
        scenario: "Script with setup path",
        url: "javascript:alert(1)//setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "Script with setup fragment",
        url: "javascript:alert(1)#/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "Script with encoded new line",
        url: "javascript://test.com/%0aalert(1)/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "Script followed by setup url in comment",
        url: "javascript:alert(1)//https://test.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0",
      },
      {
        scenario: "Script with setup url in block comment",
        url: "javascript:/*https://test.com/setup/install/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0*/alert(1)",
      },
    ])("should not parse javascript scheme", (_props) => {
      it(`should not parse: ${_props.scenario}`, () => {
        expect.assertions(1);
        expect(() => ParseSetupUrlService.parse(_props.url)).toThrow(
          "Cannot parse setup url. The url does not match the pattern.",
        );
      });
    });

    it("should not parse if the domain does not validate", async () => {
      const url = "http:///setup/start/571bec7e-6cce-451d-b53a-f8c93e147228/5ea0fc9c-b180-4873-8e00-9457862e43e0";

      expect.assertions(1);
      await expect(() => ParseSetupUrlService.parse(url)).toThrow("Cannot parse setup url. The domain is not valid.");
    });
  });
});
