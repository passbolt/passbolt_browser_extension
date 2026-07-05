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
import { Fido2Events } from "./fido2Events";
import Fido2CreateController from "../controller/fido2/fido2CreateController";
import Fido2GetController from "../controller/fido2/fido2GetController";
import Fido2ErrorReporter from "../service/fido2/fido2ErrorReporter";
import GetActiveAccountService from "../service/account/getActiveAccountService";
import BuildApiClientOptionsService from "../service/account/buildApiClientOptionsService";

jest.mock("../controller/fido2/fido2CreateController");
jest.mock("../controller/fido2/fido2GetController");
jest.mock("../service/fido2/fido2ErrorReporter");
jest.mock("../service/account/getActiveAccountService", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
jest.mock("../service/account/buildApiClientOptionsService");

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
    tab: { id: 7 },
  };
};

const account = { userId: "d57c10f5-639d-5160-9c81-8a0c6c4ec856" };
const apiClientOptions = { sentinel: "api-client-options" };
const options = { challenge: "abc", rpId: "example.com" };
const origin = "https://example.com";

let worker;
let mockHasCandidates, mockGetExec, mockCreateExec;

beforeEach(() => {
  jest.clearAllMocks();
  worker = buildWorker();

  GetActiveAccountService.get.mockResolvedValue(account);
  BuildApiClientOptionsService.buildFromAccount.mockReturnValue(apiClientOptions);

  mockHasCandidates = jest.fn().mockResolvedValue(true);
  mockGetExec = jest.fn().mockResolvedValue(undefined);
  mockCreateExec = jest.fn().mockResolvedValue(undefined);
  Fido2GetController.mockImplementation(() => ({ hasCandidates: mockHasCandidates, _exec: mockGetExec }));
  Fido2CreateController.mockImplementation(() => ({ _exec: mockCreateExec }));
  Fido2ErrorReporter.report.mockResolvedValue(undefined);

  Fido2Events.listen(worker);
});

describe("Fido2Events", () => {
  describe("passbolt.fido2.has-passkeys", () => {
    it("emits the boolean returned by controller.hasCandidates", async () => {
      expect.assertions(3);

      await worker.handlers["passbolt.fido2.has-passkeys"]("req-1", options, origin);

      expect(Fido2GetController).toHaveBeenCalledWith(worker, "req-1", apiClientOptions, account, true);
      expect(mockHasCandidates).toHaveBeenCalledWith(options, origin);
      expect(worker.port.emit).toHaveBeenCalledWith("req-1", "SUCCESS", true);
    });

    it("emits false when hasCandidates is false", async () => {
      expect.assertions(1);
      mockHasCandidates.mockResolvedValue(false);

      await worker.handlers["passbolt.fido2.has-passkeys"]("req-1", options, origin);

      expect(worker.port.emit).toHaveBeenCalledWith("req-1", "SUCCESS", false);
    });

    it("emits false and never builds a controller when the provider is inactive (no account)", async () => {
      expect.assertions(2);
      GetActiveAccountService.get.mockRejectedValue(new Error("no account"));

      await worker.handlers["passbolt.fido2.has-passkeys"]("req-1", options, origin);

      expect(worker.port.emit).toHaveBeenCalledWith("req-1", "SUCCESS", false);
      expect(Fido2GetController).not.toHaveBeenCalled();
    });
  });

  describe("passbolt.fido2.get", () => {
    it("delegates to Fido2GetController._exec with the options and origin", async () => {
      expect.assertions(2);

      await worker.handlers["passbolt.fido2.get"]("req-2", options, origin);

      expect(Fido2GetController).toHaveBeenCalledWith(worker, "req-2", apiClientOptions, account, true);
      expect(mockGetExec).toHaveBeenCalledWith(options, origin);
    });

    it("emits SUCCESS null (platform fallback) when the provider is inactive", async () => {
      expect.assertions(2);
      GetActiveAccountService.get.mockRejectedValue(new Error("no account"));

      await worker.handlers["passbolt.fido2.get"]("req-2", options, origin);

      expect(worker.port.emit).toHaveBeenCalledWith("req-2", "SUCCESS", null);
      expect(mockGetExec).not.toHaveBeenCalled();
    });
  });

  describe("passbolt.fido2.create", () => {
    it("delegates to Fido2CreateController._exec with the options and origin", async () => {
      expect.assertions(2);

      await worker.handlers["passbolt.fido2.create"]("req-3", options, origin);

      expect(Fido2CreateController).toHaveBeenCalledWith(worker, "req-3", apiClientOptions, account, true);
      expect(mockCreateExec).toHaveBeenCalledWith(options, origin);
    });

    it("emits SUCCESS null (platform fallback) when the provider is inactive", async () => {
      expect.assertions(2);
      GetActiveAccountService.get.mockRejectedValue(new Error("no account"));

      await worker.handlers["passbolt.fido2.create"]("req-3", options, origin);

      expect(worker.port.emit).toHaveBeenCalledWith("req-3", "SUCCESS", null);
      expect(mockCreateExec).not.toHaveBeenCalled();
    });
  });

  describe("resolveProviderContext fallback", () => {
    it("marks the context unauthenticated when only the anonymous account resolves", async () => {
      expect.assertions(1);
      GetActiveAccountService.get.mockReset();
      GetActiveAccountService.get.mockRejectedValueOnce(new Error("not signed in")).mockResolvedValueOnce(account);

      await worker.handlers["passbolt.fido2.has-passkeys"]("req-4", options, origin);

      expect(Fido2GetController).toHaveBeenCalledWith(worker, "req-4", apiClientOptions, account, false);
    });
  });

  describe("passbolt.fido2.report", () => {
    it("forwards the content-script error report to the error reporter", async () => {
      expect.assertions(1);
      const report = { name: "TypeError", message: "boom", stack: "stack", context: "relay", extra: { a: 1 } };

      await worker.handlers["passbolt.fido2.report"](report);

      expect(Fido2ErrorReporter.report).toHaveBeenCalledWith(
        { name: "TypeError", message: "boom", stack: "stack" },
        { context: "relay", extra: { a: 1 } },
      );
    });
  });
});
