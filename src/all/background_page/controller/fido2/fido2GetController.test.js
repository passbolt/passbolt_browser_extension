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
import Fido2GetController from "./fido2GetController";
import PasskeyVaultService from "../../service/fido2/passkeyVaultService";
import Fido2PinService from "../../service/fido2/fido2PinService";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";

jest.mock("../../service/fido2/passkeyVaultService");
jest.mock("../../service/fido2/fido2PinService");
jest.mock("../../service/passphrase/getPassphraseService");

const account = { userId: "d57c10f5-639d-5160-9c81-8a0c6c4ec856", domain: "https://passbolt.local" };
const worker = { port: { emit: jest.fn() }, tab: { id: 1 } };

let mockFindResourcesForRpId, mockFindPasskeysForRpId;

beforeEach(() => {
  jest.clearAllMocks();
  mockFindResourcesForRpId = jest.fn();
  mockFindPasskeysForRpId = jest.fn();
  PasskeyVaultService.mockImplementation(() => ({
    findResourcesForRpId: mockFindResourcesForRpId,
    findPasskeysForRpId: mockFindPasskeysForRpId,
  }));
});

const buildController = () => new Fido2GetController(worker, "req-1", {}, account, true);

describe("Fido2GetController", () => {
  describe("::hasCandidates", () => {
    it("returns true when the vault holds a matching resource for the site", async () => {
      expect.assertions(2);
      mockFindResourcesForRpId.mockResolvedValue([{ id: "r1" }]);
      const controller = buildController();

      const result = await controller.hasCandidates({ rpId: "example.com" }, "https://example.com");

      expect(result).toBe(true);
      expect(mockFindResourcesForRpId).toHaveBeenCalledWith("example.com");
    });

    it("returns false when no resource matches the site", async () => {
      expect.assertions(1);
      mockFindResourcesForRpId.mockResolvedValue([]);
      const controller = buildController();

      const result = await controller.hasCandidates({ rpId: "example.com" }, "https://example.com");

      expect(result).toBe(false);
    });

    it("returns false (and never queries the vault) when the rpId is cross-site", async () => {
      expect.assertions(2);
      const controller = buildController();

      const result = await controller.hasCandidates({ rpId: "evil.com" }, "https://example.com");

      expect(result).toBe(false);
      expect(mockFindResourcesForRpId).not.toHaveBeenCalled();
    });

    it("returns false when the vault lookup throws", async () => {
      expect.assertions(1);
      mockFindResourcesForRpId.mockRejectedValue(new Error("storage error"));
      const controller = buildController();

      const result = await controller.hasCandidates({ rpId: "example.com" }, "https://example.com");

      expect(result).toBe(false);
    });

    it("defaults the rpId to the origin host when none is provided", async () => {
      expect.assertions(1);
      mockFindResourcesForRpId.mockResolvedValue([{ id: "r1" }]);
      const controller = buildController();

      await controller.hasCandidates({}, "https://app.example.com");

      expect(mockFindResourcesForRpId).toHaveBeenCalledWith("app.example.com");
    });
  });

  describe("::_selectPasskey", () => {
    const rpId = "example.com";
    const resource = { id: "r1" };

    it("returns the first passkey of the resource when allowCredentials is empty", async () => {
      expect.assertions(1);
      mockFindPasskeysForRpId.mockResolvedValue([
        { resource: { id: "r1" }, passkey: { credential_id: "c1" } },
        { resource: { id: "r1" }, passkey: { credential_id: "c2" } },
      ]);
      const controller = buildController();

      const passkey = await controller._selectPasskey(rpId, resource, "passphrase", []);

      expect(passkey).toStrictEqual({ credential_id: "c1" });
    });

    it("returns the first passkey when allowCredentials is undefined", async () => {
      expect.assertions(1);
      mockFindPasskeysForRpId.mockResolvedValue([
        { resource: { id: "r1" }, passkey: { credential_id: "c1" } },
      ]);
      const controller = buildController();

      const passkey = await controller._selectPasskey(rpId, resource, "passphrase", undefined);

      expect(passkey).toStrictEqual({ credential_id: "c1" });
    });

    it("returns only the passkey whose credential_id is in allowCredentials", async () => {
      expect.assertions(1);
      mockFindPasskeysForRpId.mockResolvedValue([
        { resource: { id: "r1" }, passkey: { credential_id: "c1" } },
        { resource: { id: "r1" }, passkey: { credential_id: "c2" } },
      ]);
      const controller = buildController();

      const passkey = await controller._selectPasskey(rpId, resource, "passphrase", [{ id: "c2" }]);

      expect(passkey).toStrictEqual({ credential_id: "c2" });
    });

    it("returns null when allowCredentials matches no stored passkey", async () => {
      expect.assertions(1);
      mockFindPasskeysForRpId.mockResolvedValue([
        { resource: { id: "r1" }, passkey: { credential_id: "c1" } },
      ]);
      const controller = buildController();

      const passkey = await controller._selectPasskey(rpId, resource, "passphrase", [{ id: "does-not-exist" }]);

      expect(passkey).toBeNull();
    });

    it("ignores passkeys belonging to other resources", async () => {
      expect.assertions(1);
      mockFindPasskeysForRpId.mockResolvedValue([
        { resource: { id: "r2" }, passkey: { credential_id: "other" } },
        { resource: { id: "r1" }, passkey: { credential_id: "c1" } },
      ]);
      const controller = buildController();

      const passkey = await controller._selectPasskey(rpId, resource, "passphrase", []);

      expect(passkey).toStrictEqual({ credential_id: "c1" });
    });

    it("returns null when the resource holds no passkey", async () => {
      expect.assertions(1);
      mockFindPasskeysForRpId.mockResolvedValue([
        { resource: { id: "r2" }, passkey: { credential_id: "other" } },
      ]);
      const controller = buildController();

      const passkey = await controller._selectPasskey(rpId, resource, "passphrase", []);

      expect(passkey).toBeNull();
    });
  });
});
