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
 * @since         5.13.0
 */

import WebauthnOriginValidationService from "./webauthnOriginValidationService";

describe("WebauthnOriginValidationService", () => {
  describe("::resolveRpId", () => {
    it("defaults to the origin host when no rpId is provided", () => {
      expect(WebauthnOriginValidationService.resolveRpId(undefined, "https://example.com")).toStrictEqual("example.com");
    });

    it("accepts an rpId equal to the host", () => {
      expect(WebauthnOriginValidationService.resolveRpId("example.com", "https://example.com")).toStrictEqual("example.com");
    });

    it("accepts an rpId that is a registrable suffix of the host", () => {
      expect(WebauthnOriginValidationService.resolveRpId("example.com", "https://app.example.com")).toStrictEqual("example.com");
    });

    it("is case-insensitive", () => {
      expect(WebauthnOriginValidationService.resolveRpId("Example.COM", "https://APP.example.com")).toStrictEqual("example.com");
    });

    it("rejects a cross-site rpId", () => {
      expect(() => WebauthnOriginValidationService.resolveRpId("evil.com", "https://example.com")).toThrow();
    });

    it("rejects a sibling-domain rpId that is not a suffix on a label boundary", () => {
      expect(() => WebauthnOriginValidationService.resolveRpId("ample.com", "https://example.com")).toThrow();
    });

    it("rejects a bare public suffix rpId", () => {
      expect(() => WebauthnOriginValidationService.resolveRpId("com", "https://example.com")).toThrow();
    });

    it("rejects an insecure http origin", () => {
      expect(() => WebauthnOriginValidationService.resolveRpId("example.com", "http://example.com")).toThrow();
    });

    it("allows a localhost http origin", () => {
      expect(WebauthnOriginValidationService.resolveRpId(undefined, "http://localhost:8443")).toStrictEqual("localhost");
    });
  });
});
