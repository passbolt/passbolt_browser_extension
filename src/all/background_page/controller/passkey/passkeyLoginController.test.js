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
import PasskeyLoginController from "./passkeyLoginController";
import AuthVerifyLoginChallengeService from "../../service/auth/authVerifyLoginChallengeService";
import KeepSessionAliveService from "../../service/session_storage/keepSessionAliveService";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";
import PostLoginService from "../../service/auth/postLoginService";
import PasskeyApiService from "../../service/api/passkey/passkeyApiService";
import PasskeyDataStorage from "../../service/indexedDB_storage/passkeyDataStorage";
import PasskeyKitService from "../../service/passkey/passkeyKitService";
import PasskeyPopupHandlerService from "../../service/passkey/passkeyPopupHandlerService";

jest.mock("../../service/auth/authVerifyLoginChallengeService");
jest.mock("../../service/session_storage/keepSessionAliveService");
jest.mock("../../service/session_storage/passphraseStorageService");
jest.mock("../../service/auth/postLoginService");
jest.mock("../../service/api/passkey/passkeyApiService");
jest.mock("../../service/indexedDB_storage/passkeyDataStorage");
jest.mock("../../service/passkey/passkeyKitService");
jest.mock("../../service/passkey/passkeyPopupHandlerService");

const account = {
  domain: "https://passbolt.local",
  userId: "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
  userKeyFingerprint: "ABCD1234FINGERPRINT",
  userPrivateArmoredKey: "-----BEGIN PGP PRIVATE KEY BLOCK-----",
};
const worker = { port: { emit: jest.fn() }, tab: { id: 1 } };
const clientPart = { credentialId: "cred-abc" };

let mockRun, mockCollect, mockFinishLogin, mockVerify;

beforeEach(() => {
  jest.clearAllMocks();
  mockRun = jest.fn().mockResolvedValue({ token: "challenge-token", mode: "login" });
  mockCollect = jest.fn().mockResolvedValue({ credential: { id: "cred-abc" } });
  mockFinishLogin = jest.fn().mockResolvedValue({ server_kit_key: "server-half" });
  mockVerify = jest.fn().mockResolvedValue(undefined);

  PasskeyPopupHandlerService.mockImplementation(() => ({ run: mockRun }));
  PasskeyApiService.mockImplementation(() => ({ collect: mockCollect, finishLogin: mockFinishLogin }));
  AuthVerifyLoginChallengeService.mockImplementation(() => ({ verifyAndValidateLoginChallenge: mockVerify }));
  PasskeyDataStorage.get.mockResolvedValue(clientPart);
  PasskeyKitService.recoverPassphrase.mockResolvedValue("recovered passphrase");
  PassphraseStorageService.set.mockResolvedValue();
  KeepSessionAliveService.start.mockResolvedValue();
  PostLoginService.exec.mockResolvedValue();
});

describe("PasskeyLoginController", () => {
  describe("::exec", () => {
    it("collects, finishes login, recovers the passphrase and runs the GPGAuth challenge", async () => {
      expect.assertions(7);
      const controller = new PasskeyLoginController(worker, "req-1", {}, account);

      await controller.exec();

      expect(mockCollect).toHaveBeenCalledWith({ user_id: account.userId, token: "challenge-token", mode: "login" });
      expect(PasskeyDataStorage.get).toHaveBeenCalledWith("cred-abc");
      expect(mockFinishLogin).toHaveBeenCalledWith({
        user_id: account.userId,
        token: "challenge-token",
        credential: { id: "cred-abc" },
      });
      expect(PasskeyKitService.recoverPassphrase).toHaveBeenCalledWith(clientPart, "server-half");
      expect(mockVerify).toHaveBeenCalledWith(
        account.userKeyFingerprint,
        account.userPrivateArmoredKey,
        "recovered passphrase",
      );
      expect(PassphraseStorageService.set).toHaveBeenCalledWith("recovered passphrase", -1);
      expect(PostLoginService.exec).toHaveBeenCalledTimes(1);
    });

    it("caches the passphrase and starts the keep-alive on success", async () => {
      expect.assertions(2);
      const controller = new PasskeyLoginController(worker, "req-1", {}, account);

      await controller.exec();

      expect(KeepSessionAliveService.start).toHaveBeenCalledTimes(1);
      expect(PassphraseStorageService.set).toHaveBeenCalledTimes(1);
    });

    it("throws when the ceremony does not return a valid credential", async () => {
      expect.assertions(1);
      mockCollect.mockResolvedValueOnce({ credential: {} });
      const controller = new PasskeyLoginController(worker, "req-1", {}, account);

      await expect(controller.exec()).rejects.toThrow("did not return a valid credential");
    });

    it("throws when no local passkey kit is registered on this profile", async () => {
      expect.assertions(2);
      PasskeyDataStorage.get.mockResolvedValueOnce(null);
      const controller = new PasskeyLoginController(worker, "req-1", {}, account);

      await expect(controller.exec()).rejects.toThrow("No passkey kit is registered");
      expect(mockFinishLogin).not.toHaveBeenCalled();
    });

    it("throws when the server does not release the passphrase kit half", async () => {
      expect.assertions(2);
      mockFinishLogin.mockResolvedValueOnce({});
      const controller = new PasskeyLoginController(worker, "req-1", {}, account);

      await expect(controller.exec()).rejects.toThrow("did not release the passphrase kit");
      expect(PasskeyKitService.recoverPassphrase).not.toHaveBeenCalled();
    });
  });

  describe("::_exec", () => {
    it("emits SUCCESS on success", async () => {
      expect.assertions(1);
      const controller = new PasskeyLoginController(worker, "req-9", {}, account);

      await controller._exec();

      expect(worker.port.emit).toHaveBeenCalledWith("req-9", "SUCCESS");
    });

    it("emits ERROR when the flow fails", async () => {
      expect.assertions(1);
      const error = new Error("kaboom");
      mockRun.mockRejectedValueOnce(error);
      const controller = new PasskeyLoginController(worker, "req-9", {}, account);

      await controller._exec();

      expect(worker.port.emit).toHaveBeenCalledWith("req-9", "ERROR", error);
    });
  });
});
