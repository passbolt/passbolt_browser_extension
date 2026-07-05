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
import PasskeyEnrollController from "./passkeyEnrollController";
import GetPassphraseService from "../../service/passphrase/getPassphraseService";
import PasskeyApiService from "../../service/api/passkey/passkeyApiService";
import PasskeyDataStorage from "../../service/indexedDB_storage/passkeyDataStorage";
import PasskeyKitService from "../../service/passkey/passkeyKitService";
import PasskeyPopupHandlerService from "../../service/passkey/passkeyPopupHandlerService";

jest.mock("../../service/passphrase/getPassphraseService");
jest.mock("../../service/api/passkey/passkeyApiService");
jest.mock("../../service/indexedDB_storage/passkeyDataStorage");
jest.mock("../../service/passkey/passkeyKitService");
jest.mock("../../service/passkey/passkeyPopupHandlerService");

const account = { domain: "https://passbolt.local", userId: "d57c10f5-639d-5160-9c81-8a0c6c4ec856" };
const worker = { port: { emit: jest.fn() }, tab: { id: 1 } };

let mockGetPassphrase, mockRun, mockCollect, mockFinishSetup;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetPassphrase = jest.fn().mockResolvedValue("the master passphrase");
  mockRun = jest.fn().mockResolvedValue({ token: "challenge-token", mode: "setup" });
  mockCollect = jest.fn().mockResolvedValue({ credential: { id: "cred-abc" } });
  mockFinishSetup = jest.fn().mockResolvedValue({ id: "stored-cred", name: "My laptop key" });

  GetPassphraseService.mockImplementation(() => ({ getPassphrase: mockGetPassphrase }));
  PasskeyPopupHandlerService.mockImplementation(() => ({ run: mockRun }));
  PasskeyApiService.mockImplementation(() => ({ collect: mockCollect, finishSetup: mockFinishSetup }));
  PasskeyKitService.generateKit.mockResolvedValue({ clientPart: { credentialId: "cred-abc" }, serverKitKey: "server-half" });
  PasskeyDataStorage.save.mockResolvedValue();
});

describe("PasskeyEnrollController", () => {
  describe("::exec", () => {
    it("passes the user-provided name through to finishSetup and stores the client kit locally", async () => {
      expect.assertions(5);
      const controller = new PasskeyEnrollController(worker, "req-1", {}, account);

      const stored = await controller.exec("My laptop key");

      expect(mockCollect).toHaveBeenCalledWith({ user_id: account.userId, token: "challenge-token", mode: "setup" });
      expect(PasskeyKitService.generateKit).toHaveBeenCalledWith("the master passphrase", "cred-abc");
      expect(mockFinishSetup).toHaveBeenCalledWith({
        token: "challenge-token",
        credential: { id: "cred-abc" },
        server_kit_key: "server-half",
        name: "My laptop key",
      });
      expect(PasskeyDataStorage.save).toHaveBeenCalledWith({ credentialId: "cred-abc" });
      expect(stored).toStrictEqual({ id: "stored-cred", name: "My laptop key" });
    });

    it("trims a padded name before sending it", async () => {
      expect.assertions(1);
      const controller = new PasskeyEnrollController(worker, "req-1", {}, account);

      await controller.exec("  Padded name  ");

      expect(mockFinishSetup).toHaveBeenCalledWith(expect.objectContaining({ name: "Padded name" }));
    });

    it("sends a null name when the name is blank/whitespace or omitted", async () => {
      expect.assertions(2);
      const controller = new PasskeyEnrollController(worker, "req-1", {}, account);

      await controller.exec("   ");
      expect(mockFinishSetup).toHaveBeenCalledWith(expect.objectContaining({ name: null }));

      mockFinishSetup.mockClear();
      await controller.exec();
      expect(mockFinishSetup).toHaveBeenCalledWith(expect.objectContaining({ name: null }));
    });

    it("throws when the ceremony does not return a valid credential", async () => {
      expect.assertions(2);
      const controller = new PasskeyEnrollController(worker, "req-1", {}, account);

      mockCollect.mockResolvedValueOnce({ credential: null });
      await expect(controller.exec("name")).rejects.toThrow("did not return a valid credential");

      mockCollect.mockResolvedValueOnce({ credential: {} });
      await expect(controller.exec("name")).rejects.toThrow("did not return a valid credential");
    });
  });

  describe("::_exec", () => {
    it("emits SUCCESS with the stored credential", async () => {
      expect.assertions(1);
      const controller = new PasskeyEnrollController(worker, "req-42", {}, account);

      await controller._exec("My laptop key");

      expect(worker.port.emit).toHaveBeenCalledWith("req-42", "SUCCESS", { id: "stored-cred", name: "My laptop key" });
    });

    it("emits ERROR when the ceremony fails", async () => {
      expect.assertions(1);
      const error = new Error("ceremony blew up");
      mockRun.mockRejectedValueOnce(error);
      const controller = new PasskeyEnrollController(worker, "req-42", {}, account);

      await controller._exec("My laptop key");

      expect(worker.port.emit).toHaveBeenCalledWith("req-42", "ERROR", error);
    });
  });
});
