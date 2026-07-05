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
import { PasskeyEvents } from "./passkeyEvents";
import PasskeyEnrollController from "../controller/passkey/passkeyEnrollController";
import PasskeyLoginController from "../controller/passkey/passkeyLoginController";
import PasskeyDataStorage from "../service/indexedDB_storage/passkeyDataStorage";
import PasskeyApiService from "../service/api/passkey/passkeyApiService";

jest.mock("../controller/passkey/passkeyEnrollController");
jest.mock("../controller/passkey/passkeyLoginController");
jest.mock("../service/indexedDB_storage/passkeyDataStorage");
jest.mock("../service/api/passkey/passkeyApiService");

/**
 * Build a worker whose port.on records the registered handlers so a test can drive them directly.
 * @returns {object}
 */
const buildWorker = () => {
  const handlers = {};
  return {
    handlers,
    port: {
      on: jest.fn((name, fn) => {
        handlers[name] = fn;
      }),
      emit: jest.fn(),
    },
    tab: { id: 1 },
  };
};

const apiClientOptions = { foo: "bar" };
const account = { domain: "https://passbolt.local", userId: "d57c10f5-639d-5160-9c81-8a0c6c4ec856" };

let worker;
let mockFindAllCredentials, mockDeleteCredential, mockIsOrgEnabled, mockSetOrgEnabled;
let mockEnrollExec, mockLoginExec;

beforeEach(() => {
  jest.clearAllMocks();
  worker = buildWorker();

  mockFindAllCredentials = jest.fn();
  mockDeleteCredential = jest.fn().mockResolvedValue(undefined);
  mockIsOrgEnabled = jest.fn();
  mockSetOrgEnabled = jest.fn();
  PasskeyApiService.mockImplementation(() => ({
    findAllCredentials: mockFindAllCredentials,
    deleteCredential: mockDeleteCredential,
    isOrganizationEnabled: mockIsOrgEnabled,
    setOrganizationEnabled: mockSetOrgEnabled,
  }));

  mockEnrollExec = jest.fn().mockResolvedValue(undefined);
  mockLoginExec = jest.fn().mockResolvedValue(undefined);
  PasskeyEnrollController.mockImplementation(() => ({ _exec: mockEnrollExec }));
  PasskeyLoginController.mockImplementation(() => ({ _exec: mockLoginExec }));

  PasskeyDataStorage.hasAny.mockResolvedValue(true);
  PasskeyDataStorage.delete.mockResolvedValue(undefined);

  PasskeyEvents.listen(worker, apiClientOptions, account);
});

describe("PasskeyEvents", () => {
  describe("passbolt.passkey.list-credentials", () => {
    it("emits SUCCESS with the credentials array from the response body", async () => {
      expect.assertions(1);
      const credentials = [{ id: "c1" }, { id: "c2" }];
      mockFindAllCredentials.mockResolvedValue({ credentials });

      await worker.handlers["passbolt.passkey.list-credentials"]("req-1");

      expect(worker.port.emit).toHaveBeenCalledWith("req-1", "SUCCESS", credentials);
    });

    it("emits SUCCESS with an empty array when the body has no credentials", async () => {
      expect.assertions(1);
      mockFindAllCredentials.mockResolvedValue({});

      await worker.handlers["passbolt.passkey.list-credentials"]("req-1");

      expect(worker.port.emit).toHaveBeenCalledWith("req-1", "SUCCESS", []);
    });

    it("emits ERROR when the API call fails", async () => {
      expect.assertions(1);
      const error = new Error("api down");
      mockFindAllCredentials.mockRejectedValue(error);

      await worker.handlers["passbolt.passkey.list-credentials"]("req-1");

      expect(worker.port.emit).toHaveBeenCalledWith("req-1", "ERROR", error);
    });
  });

  describe("passbolt.passkey.delete-credential", () => {
    it("deletes the server credential AND the matching local kit, then emits SUCCESS", async () => {
      expect.assertions(3);

      await worker.handlers["passbolt.passkey.delete-credential"]("req-2", "cred-abc");

      expect(mockDeleteCredential).toHaveBeenCalledWith("cred-abc");
      expect(PasskeyDataStorage.delete).toHaveBeenCalledWith("cred-abc");
      expect(worker.port.emit).toHaveBeenCalledWith("req-2", "SUCCESS");
    });

    it("still succeeds when there is no local kit to remove", async () => {
      expect.assertions(2);
      PasskeyDataStorage.delete.mockRejectedValueOnce(new Error("no local kit"));

      await worker.handlers["passbolt.passkey.delete-credential"]("req-2", "cred-abc");

      expect(mockDeleteCredential).toHaveBeenCalledWith("cred-abc");
      expect(worker.port.emit).toHaveBeenCalledWith("req-2", "SUCCESS");
    });

    it("emits ERROR when the server deletion fails", async () => {
      expect.assertions(2);
      const error = new Error("cannot delete");
      mockDeleteCredential.mockRejectedValueOnce(error);

      await worker.handlers["passbolt.passkey.delete-credential"]("req-2", "cred-abc");

      expect(worker.port.emit).toHaveBeenCalledWith("req-2", "ERROR", error);
      expect(PasskeyDataStorage.delete).not.toHaveBeenCalled();
    });
  });

  describe("passbolt.passkey.enroll", () => {
    it("passes the name through to the enroll controller", async () => {
      expect.assertions(2);

      await worker.handlers["passbolt.passkey.enroll"]("req-3", "My laptop key");

      expect(PasskeyEnrollController).toHaveBeenCalledWith(worker, "req-3", apiClientOptions, account);
      expect(mockEnrollExec).toHaveBeenCalledWith("My laptop key");
    });
  });

  describe("passbolt.passkey.login", () => {
    it("delegates to the login controller", async () => {
      expect.assertions(2);

      await worker.handlers["passbolt.passkey.login"]("req-4");

      expect(PasskeyLoginController).toHaveBeenCalledWith(worker, "req-4", apiClientOptions, account);
      expect(mockLoginExec).toHaveBeenCalledTimes(1);
    });
  });

  describe("passbolt.passkey.has-local-kit", () => {
    it("emits SUCCESS with whether a local kit exists", async () => {
      expect.assertions(1);
      PasskeyDataStorage.hasAny.mockResolvedValue(true);

      await worker.handlers["passbolt.passkey.has-local-kit"]("req-5");

      expect(worker.port.emit).toHaveBeenCalledWith("req-5", "SUCCESS", true);
    });
  });

  describe("passbolt.passkey.is-org-enabled", () => {
    it("emits SUCCESS with the organization flag", async () => {
      expect.assertions(1);
      mockIsOrgEnabled.mockResolvedValue(false);

      await worker.handlers["passbolt.passkey.is-org-enabled"]("req-6");

      expect(worker.port.emit).toHaveBeenCalledWith("req-6", "SUCCESS", false);
    });

    it("falls back to SUCCESS true on any error (never hides a working feature)", async () => {
      expect.assertions(1);
      mockIsOrgEnabled.mockRejectedValue(new Error("transient"));

      await worker.handlers["passbolt.passkey.is-org-enabled"]("req-6");

      expect(worker.port.emit).toHaveBeenCalledWith("req-6", "SUCCESS", true);
    });
  });

  describe("passbolt.passkey.set-org-enabled", () => {
    it("emits SUCCESS with the coerced result", async () => {
      expect.assertions(2);
      mockSetOrgEnabled.mockResolvedValue(true);

      await worker.handlers["passbolt.passkey.set-org-enabled"]("req-7", 1);

      expect(mockSetOrgEnabled).toHaveBeenCalledWith(true);
      expect(worker.port.emit).toHaveBeenCalledWith("req-7", "SUCCESS", true);
    });

    it("emits ERROR when the update fails", async () => {
      expect.assertions(1);
      const error = new Error("not admin");
      mockSetOrgEnabled.mockRejectedValue(error);

      await worker.handlers["passbolt.passkey.set-org-enabled"]("req-7", true);

      expect(worker.port.emit).toHaveBeenCalledWith("req-7", "ERROR", error);
    });
  });
});
