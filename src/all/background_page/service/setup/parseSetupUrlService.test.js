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

const USER_ID = "571bec7e-6cce-451d-b53a-f8c93e147228";
const TOKEN = "5ea0fc9c-b180-4873-8e00-9457862e43e0";
const HOSTS = ["test.com", "cloud.test.com", "passbolt", "127.0.0.1", "[0:0:0:0:0:0:0:1]"];
const PORTS = ["", ":4443"];
const SUBFOLDERS = ["", "/", "/subfolder", "/subfolder/"];
const SUFFIXES = [
  "",
  "#fragment",
  `#/setup/install/${USER_ID}/${TOKEN}`,
  "?first-install=1",
  `?redirect=/setup/install/${USER_ID}/${TOKEN}`,
  "?first-install=1#fragment",
];

/**
 * Build setup url variations (host, port, subfolder, query string and fragment suffix) for the given schemes and setup paths.
 * @param {Array<string>} schemes The url schemes, i.e. ["http", "https"]. An empty scheme produces a url without scheme.
 * @param {Array<string>} setupPaths The paths following "/setup/", i.e. ["install/<user_id>/<token>"]
 * @returns {Array<{scenario: string, url: string, domain: string}>}
 */
function setupUrlVariations(schemes, setupPaths) {
  const variations = [];
  for (const scheme of schemes) {
    for (const host of HOSTS) {
      for (const port of PORTS) {
        for (const subfolder of SUBFOLDERS) {
          for (const setupPath of setupPaths) {
            for (const suffix of SUFFIXES) {
              const prefix = scheme ? `${scheme}://` : "";
              const base = `${prefix}${host}${port}${subfolder}`;
              variations.push({
                scenario: `${base}/setup/${setupPath}${suffix}`,
                url: `${base}/setup/${setupPath}${suffix}`,
                domain: base.replace(/\/*$/, ""),
              });
            }
          }
        }
      }
    }
  }
  return variations;
}

describe("ParseSetupUrlService", () => {
  describe("ParseSetupUrlService:parse", () => {
    describe.each(setupUrlVariations(["http", "https"], [`install/${USER_ID}/${TOKEN}`, `start/${USER_ID}/${TOKEN}`]))(
      "should parse",
      (_props) => {
        it(`should parse: ${_props.scenario}`, () => {
          const parseResult = ParseSetupUrlService.parse(_props.url);

          expect.assertions(3);
          expect(parseResult.domain).toBe(_props.domain);
          expect(parseResult.user_id).toBe(USER_ID);
          expect(parseResult.authentication_token_token).toBe(TOKEN);
        });
      },
    );

    describe.each([
      // Wrong path, missing token, missing user id
      ...setupUrlVariations(["http", "https"], [`test/${USER_ID}/${TOKEN}`, `install/${USER_ID}`, "install"]),
      // No scheme or invalid scheme
      ...setupUrlVariations(
        ["", "ftp", "ftps", "ssh", "file", "javascript"],
        [`install/${USER_ID}/${TOKEN}`, `start/${USER_ID}/${TOKEN}`],
      ),
    ])("should not parse", (_props) => {
      it(`should not parse: ${_props.scenario}`, () => {
        expect.assertions(1);
        expect(() => ParseSetupUrlService.parse(_props.url)).toThrow(
          "Cannot parse setup url. The url does not match the pattern.",
        );
      });
    });

    describe.each([
      { scenario: "Setup path in query string", url: `https://test.com/?next=/setup/install/${USER_ID}/${TOKEN}` },
      {
        scenario: "Setup url in query string",
        url: `https://test.com/page?redirect=https://other.com/setup/install/${USER_ID}/${TOKEN}`,
      },
      {
        scenario: "Setup url in query string with subfolder",
        url: `https://test.com/subfolder?redirect=https://other.com/setup/install/${USER_ID}/${TOKEN}`,
      },
      { scenario: "Setup path in fragment", url: `https://test.com/#/setup/install/${USER_ID}/${TOKEN}` },
      {
        scenario: "Setup url in fragment",
        url: `https://test.com/page#https://other.com/setup/install/${USER_ID}/${TOKEN}`,
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
      { scenario: "Plain script", url: "javascript:alert(1)" },
      { scenario: "Script with setup path", url: `javascript:alert(1)//setup/install/${USER_ID}/${TOKEN}` },
      { scenario: "Script with setup fragment", url: `javascript:alert(1)#/setup/install/${USER_ID}/${TOKEN}` },
      {
        scenario: "Script with encoded new line",
        url: `javascript://test.com/%0aalert(1)/setup/install/${USER_ID}/${TOKEN}`,
      },
      {
        scenario: "Script followed by setup url in comment",
        url: `javascript:alert(1)//https://test.com/setup/install/${USER_ID}/${TOKEN}`,
      },
      {
        scenario: "Script with setup url in block comment",
        url: `javascript:/*https://test.com/setup/install/${USER_ID}/${TOKEN}*/alert(1)`,
      },
      {
        scenario: "Script fetching the setup url",
        url: `javascript:fetch("https://test.com/setup/install/${USER_ID}/${TOKEN}")`,
      },
      {
        scenario: "Script redirecting to the setup url",
        url: `javascript:window.location="https://test.com/setup/install/${USER_ID}/${TOKEN}"`,
      },
      {
        scenario: "Script with setup url in fragment",
        url: `javascript:void(0)#https://test.com/setup/install/${USER_ID}/${TOKEN}`,
      },
      { scenario: "Mixed case scheme", url: `JaVaScRiPt:alert(1)//https://test.com/setup/install/${USER_ID}/${TOKEN}` },
    ])("should not parse javascript scheme", (_props) => {
      it(`should not parse: ${_props.scenario}`, () => {
        expect.assertions(1);
        expect(() => ParseSetupUrlService.parse(_props.url)).toThrow(
          "Cannot parse setup url. The url does not match the pattern.",
        );
      });
    });

    it("should not parse if the domain does not validate", async () => {
      const url = `http:///setup/start/${USER_ID}/${TOKEN}`;

      expect.assertions(1);
      await expect(() => ParseSetupUrlService.parse(url)).toThrow("Cannot parse setup url. The domain is not valid.");
    });
  });
});
