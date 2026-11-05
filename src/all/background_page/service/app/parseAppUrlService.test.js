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

import ParseAppUrlService from "./parseAppUrlService";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";

const errorMatchPattern = "Cannot parse application url. The url does not match the pattern.";
const errorDomainInvalid = "Cannot parse application url. The domain is not valid.";

const domain = "https://passbolt.local";

describe("ParseAppUrlService", () => {
  describe("ParseAppUrlService:parse", () => {
    describe.each([
      {
        scenario: "TLD",
        url: "https://passbolt.local/app/folders/view/5452ecb2-0625-50d1-b1ef-d2038f5830b6",
        domain: domain,
      },
      {
        scenario: "TLD with Port",
        url: "https://passbolt.local:4443/app/passwords",
        domain: `${domain}:4443`,
      },
      {
        scenario: "Non tld",
        url: "https://passbolt/app/users",
        domain: "https://passbolt",
      },
      {
        scenario: "IP v4",
        url: "https://127.0.0.1/app/administration/mfa",
        domain: "https://127.0.0.1",
      },
      {
        scenario: "IP v4 with port",
        url: "https://127.0.0.1:4443/app/administration/users-directory",
        domain: "https://127.0.0.1:4443",
      },
      {
        scenario: "IP v6",
        url: "https://[0:0:0:0:0:0:0:1]/app/administration/internationalization",
        domain: "https://[0:0:0:0:0:0:0:1]",
      },
      {
        scenario: "IP v6 with port",
        url: "https://[0:0:0:0:0:0:0:1]:4443/app/administration/subscription",
        domain: "https://[0:0:0:0:0:0:0:1]:4443",
      },
      {
        scenario: "Trailing /",
        url: "https://passbolt.local/app/administration/account-recovery//",
        domain: `${domain}/app/administration/account-recovery/`,
      },
      {
        scenario: "Hash on domain",
        url: "https://demo.passbolt.com/#hash",
        domain: `https://demo.passbolt.com`,
      },
      {
        scenario: "Hash in subpaths",
        url: "https://demo.passbolt.com/app/users#hash",
        domain: `https://demo.passbolt.com`,
      },
    ])("should parse", (_props) => {
      let account;
      beforeEach(() => {
        account = new AccountEntity(defaultAccountDto({ domain: _props.domain }));
      });
      it(`should parse: ${_props.scenario}`, () => {
        expect.assertions(2);
        expect(() => ParseAppUrlService.parse(account, _props.url)).not.toThrow(errorMatchPattern);
        expect(() => ParseAppUrlService.parse(account, _props.url)).not.toThrow(errorDomainInvalid);
      });
    });

    describe.each([
      {
        scenario: "No domain",
        url: "/passwords",
      },
      {
        scenario: "Wrong protocol",
        url: "http://passbolt.local",
      },
      {
        scenario: "Not a domain allowed",
        url: "https://passbolt.io/passwords",
      },
      {
        scenario: "Original domain as subdomain attack",
        url: "https://passbolt.local.attacker.com",
      },
      {
        scenario: "Subdomain attack",
        url: "https://attack.passbolt.local",
      },
      {
        scenario: "Regex wild mark attack",
        url: "https://passboltxlocal",
      },
      {
        scenario: "Non application entry point",
        url: "https://passbolt.local/auth/login",
      },
      {
        scenario: "Domain look alike as hash attack",
        url: `https://www.attacker.com#${domain}`,
      },
    ])("should not parse", (_props) => {
      const account = new AccountEntity(defaultAccountDto());
      it(`should not parse: ${_props.scenario}`, () => {
        expect.assertions(1);
        expect(() => ParseAppUrlService.parse(account, _props.url)).toThrow(errorMatchPattern);
      });
    });
  });
  describe("ParseAppUrlService:getContext", () => {
    it(`should return regex based on trusted domain`, () => {
      expect.assertions(1);
      const account = new AccountEntity(defaultAccountDto());
      expect(ParseAppUrlService.getRegex(account)).toBe("^https\\:\\/\\/passbolt\\.local/?(/app.*)?(#.*)?$");
    });
    it(`should escaped characters from domain`, () => {
      const account = new AccountEntity(defaultAccountDto({ domain: "https://passbolt.local/#/" }));
      expect.assertions(1);
      expect(ParseAppUrlService.getRegex(account)).toBe("^https\\:\\/\\/passbolt\\.local\\/\\#\\//?(/app.*)?(#.*)?$");
    });
  });
});
