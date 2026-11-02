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
 * @since         5.17.0
 */
import { enableFetchMocks } from "jest-fetch-mock";
import { mockApiResponse, mockApiResponseError } from "../../../../../test/mocks/mockApiResponse";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import PassboltApiFetchError from "passbolt-styleguide/src/shared/lib/Error/PassboltApiFetchError";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import WebauthnSetupCeremonyService from "./webauthnSetupCeremonyService";
import WebauthnSetupCeremonySessionStorageService from "../sessionStorage/webauthnSetupCeremonySessionStorageService";
import WebauthnSetupCeremonyEntity from "../../model/entity/mfa/webauthnSetupCeremonyEntity";
import WorkerService from "../worker/workerService";
import AccountEntity from "../../model/entity/account/accountEntity";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultWebauthnCredentialCreationOptionsDto } from "../../model/entity/mfa/webauthnCredentialCreationOptionsEntity.test.data";
import { defaultWebauthnRegistrationResponseDto } from "../../model/entity/mfa/webauthnRegistrationResponseEntity.test.data";
import {
  defaultWebauthnSetupCeremonyDto,
  expiredWebauthnSetupCeremonyDto,
  webauthnSetupCeremonyWithCredentialDto,
} from "../../model/entity/mfa/webauthnSetupCeremonyEntity.test.data";
import WebauthnCeremonyNotFoundError from "../../error/webauthnCeremonyNotFoundError";
import WebauthnCeremonyError from "../../error/webauthnCeremonyError";
import WebauthnCeremonyAbortedError from "../../error/webauthnCeremonyAbortedError";

const TAB_ID = 1;
const OTHER_TAB_ID = 2;
const RUN_EVENT = "passbolt.app-bootstrap.run-webauthn-ceremony";
const ABORT_EVENT = "passbolt.app-bootstrap.abort-webauthn-ceremony";
const DONE_EVENT = "passbolt.mfa-setup.webauthn-ceremony-done";

const storeCeremony = async (dto) => {
  const ceremony = new WebauthnSetupCeremonyEntity(dto);
  await WebauthnSetupCeremonySessionStorageService.set(ceremony);
  return ceremony;
};

beforeEach(() => {
  enableFetchMocks();
  jest.clearAllMocks();
});

describe("WebauthnSetupCeremonyService", () => {
  let service, appBootstrapWorker, appWorker;

  beforeEach(() => {
    appBootstrapWorker = { port: { emit: jest.fn() }, tab: { id: TAB_ID } };
    appWorker = { port: { emit: jest.fn() }, tab: { id: TAB_ID } };
    jest.spyOn(WorkerService, "get").mockImplementation(async (name) => {
      if (name === "AppBootstrap") {
        return appBootstrapWorker;
      }
      if (name === "App") {
        return appWorker;
      }
      throw new Error(`Could not find worker ${name}.`);
    });
    service = new WebauthnSetupCeremonyService(defaultApiClientOptions(), new AccountEntity(defaultAccountDto()));
  });

  describe("WebauthnSetupCeremonyService::begin", () => {
    const beginBody = (data = {}) => ({
      handle: "5f2ab5a4-9dd7-4a7c-a0fd-2d8f4b1b3f0c",
      credentialCreationOptions: defaultWebauthnCredentialCreationOptionsDto(data),
    });

    it("stores the ceremony and hands the options to the content script", async () => {
      expect.assertions(6);
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/begin\.json/, () => mockApiResponse(beginBody()));

      await service.begin(TAB_ID);

      const ceremony = await WebauthnSetupCeremonySessionStorageService.get();
      expect(ceremony.tabId).toEqual(TAB_ID);
      expect(ceremony.handle).toEqual(beginBody().handle);
      expect(ceremony.hasCredential).toBe(false);
      expect(ceremony.isExpired).toBe(false);
      expect(WorkerService.get).toHaveBeenCalledWith("AppBootstrap", TAB_ID);
      expect(appBootstrapWorker.port.emit).toHaveBeenCalledWith(RUN_EVENT, {
        id: ceremony.id,
        options: defaultWebauthnCredentialCreationOptionsDto(),
      });
    });

    it("supersedes a ceremony pending on the same tab and tells the content script to abort it", async () => {
      expect.assertions(4);
      const pending = await storeCeremony(defaultWebauthnSetupCeremonyDto({ tab_id: TAB_ID }));
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/begin\.json/, () => mockApiResponse(beginBody()));

      await service.begin(TAB_ID);

      const ceremony = await WebauthnSetupCeremonySessionStorageService.get();
      expect(ceremony.id).not.toEqual(pending.id);
      expect(appBootstrapWorker.port.emit).toHaveBeenNthCalledWith(1, ABORT_EVENT, { id: pending.id });
      expect(appBootstrapWorker.port.emit).toHaveBeenNthCalledWith(
        2,
        RUN_EVENT,
        expect.objectContaining({ id: ceremony.id }),
      );
      expect(appWorker.port.emit).not.toHaveBeenCalled();
    });

    it("supersedes a ceremony pending on another tab, tells its content script to abort it and its app it ended", async () => {
      expect.assertions(6);
      const pending = await storeCeremony(defaultWebauthnSetupCeremonyDto({ tab_id: OTHER_TAB_ID }));
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/begin\.json/, () => mockApiResponse(beginBody()));

      await service.begin(TAB_ID);

      const ceremony = await WebauthnSetupCeremonySessionStorageService.get();
      expect(ceremony.tabId).toEqual(TAB_ID);
      expect(ceremony.id).not.toEqual(pending.id);
      expect(WorkerService.get).toHaveBeenCalledWith("AppBootstrap", OTHER_TAB_ID);
      expect(appBootstrapWorker.port.emit).toHaveBeenCalledWith(ABORT_EVENT, { id: pending.id });
      expect(WorkerService.get).toHaveBeenCalledWith("App", OTHER_TAB_ID);
      expect(appWorker.port.emit).toHaveBeenCalledWith(DONE_EVENT, {
        success: false,
        result: new WebauthnCeremonyAbortedError("The passkey ceremony was superseded by a new one."),
      });
    });

    it("supersedes a ceremony pending on another tab even if its workers cannot be reached", async () => {
      expect.assertions(3);
      const pending = await storeCeremony(defaultWebauthnSetupCeremonyDto({ tab_id: OTHER_TAB_ID }));
      WorkerService.get.mockImplementation(async (name, tabId) => {
        if (tabId === OTHER_TAB_ID) {
          throw new Error("Could not find worker AppBootstrap for tab 2.");
        }
        return appBootstrapWorker;
      });
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/begin\.json/, () => mockApiResponse(beginBody()));

      await service.begin(TAB_ID);

      expect((await WebauthnSetupCeremonySessionStorageService.get()).id).not.toEqual(pending.id);
      expect(appBootstrapWorker.port.emit).toHaveBeenCalledTimes(1);
      expect(appWorker.port.emit).not.toHaveBeenCalled();
    });

    it("overwrites an expired ceremony without aborting it", async () => {
      expect.assertions(2);
      const expired = await storeCeremony(expiredWebauthnSetupCeremonyDto({ tab_id: TAB_ID }));
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/begin\.json/, () => mockApiResponse(beginBody()));

      await service.begin(TAB_ID);

      expect((await WebauthnSetupCeremonySessionStorageService.get()).id).not.toEqual(expired.id);
      expect(appBootstrapWorker.port.emit).not.toHaveBeenCalledWith(ABORT_EVENT, expect.anything());
    });

    it("rejects on API error without storing a ceremony", async () => {
      expect.assertions(2);
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/begin\.json/, () => mockApiResponseError(500, "Something went wrong"));

      await expect(service.begin(TAB_ID)).rejects.toThrow(PassboltApiFetchError);
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
    });

    it("rejects invalid creation options without storing a ceremony", async () => {
      expect.assertions(2);
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/begin\.json/, () =>
        mockApiResponse(beginBody({ attestation: "direct" })),
      );

      await expect(service.begin(TAB_ID)).rejects.toThrow(EntityValidationError);
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
    });

    it("rejects creation options not matching the account without storing a ceremony", async () => {
      expect.assertions(3);
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/begin\.json/, () =>
        mockApiResponse(beginBody({ rp: { id: "evil.local", name: "Passbolt" } })),
      );

      await expect(service.begin(TAB_ID)).rejects.toThrow(WebauthnCeremonyError);
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
      expect(appBootstrapWorker.port.emit).not.toHaveBeenCalled();
    });

    it("rejects if the content script worker cannot be found without storing a ceremony", async () => {
      expect.assertions(2);
      const error = new Error("Could not find worker AppBootstrap for tab 1.");
      WorkerService.get.mockRejectedValue(error);
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/begin\.json/, () => mockApiResponse(beginBody()));

      await expect(service.begin(TAB_ID)).rejects.toBe(error);
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
    });

    it("rejects and removes the ceremony if the content script cannot be reached", async () => {
      expect.assertions(2);
      const error = new Error("Attempting to use a disconnected port object");
      appBootstrapWorker.port.emit.mockImplementation(() => {
        throw error;
      });
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/begin\.json/, () => mockApiResponse(beginBody()));

      await expect(service.begin(TAB_ID)).rejects.toBe(error);
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
    });
  });

  describe("WebauthnSetupCeremonyService::handleResult", () => {
    const successResult = (ceremony, data = {}) => ({
      success: true,
      result: {
        id: ceremony.id,
        status: "success",
        credential: defaultWebauthnRegistrationResponseDto(),
        aaguid: "fbfc3007-154e-4ecc-8c0b-6e020557d7bd",
        ...data,
      },
    });

    it("stores the credential and notifies the app worker on success", async () => {
      expect.assertions(4);
      const pending = await storeCeremony(defaultWebauthnSetupCeremonyDto({ tab_id: TAB_ID }));

      await service.handleResult(TAB_ID, successResult(pending));

      const ceremony = await WebauthnSetupCeremonySessionStorageService.get();
      expect(ceremony.credential).toEqual(defaultWebauthnRegistrationResponseDto());
      expect(ceremony.aaguid).toEqual("fbfc3007-154e-4ecc-8c0b-6e020557d7bd");
      expect(WorkerService.get).toHaveBeenCalledWith("App", TAB_ID);
      expect(appWorker.port.emit).toHaveBeenCalledWith(DONE_EVENT, {
        success: true,
        result: {
          aaguid: "fbfc3007-154e-4ecc-8c0b-6e020557d7bd",
        },
      });
    });

    it("stores a null aaguid when the content script could not read it", async () => {
      expect.assertions(2);
      const pending = await storeCeremony(defaultWebauthnSetupCeremonyDto({ tab_id: TAB_ID }));

      await service.handleResult(TAB_ID, successResult(pending, { aaguid: null }));

      expect((await WebauthnSetupCeremonySessionStorageService.get()).aaguid).toBeNull();
      expect(appWorker.port.emit).toHaveBeenCalledWith(DONE_EVENT, {
        success: true,
        result: {
          aaguid: null,
        },
      });
    });

    it("removes the ceremony and notifies the app worker on error", async () => {
      expect.assertions(2);
      const pending = await storeCeremony(defaultWebauthnSetupCeremonyDto({ tab_id: TAB_ID }));
      const error = {
        name: "WebauthnCeremonyCancelledError",
        message: "The passkey prompt was cancelled or timed out.",
      };

      await service.handleResult(TAB_ID, { id: pending.id, success: false, result: error });

      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
      expect(appWorker.port.emit).toHaveBeenCalledWith(DONE_EVENT, { success: false, result: error });
    });

    it("rejects a result whose id does not match the pending ceremony", async () => {
      expect.assertions(3);
      const pending = await storeCeremony(defaultWebauthnSetupCeremonyDto({ tab_id: TAB_ID }));

      const promise = service.handleResult(
        TAB_ID,
        successResult(pending, { id: "1cbfca6f-ab36-4e13-a5b8-7c0a1b2c3d4e" }),
      );

      await expect(promise).rejects.toThrow(WebauthnCeremonyNotFoundError);
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toEqual(pending);
      expect(appWorker.port.emit).not.toHaveBeenCalled();
    });

    it("rejects a result coming from another tab", async () => {
      expect.assertions(3);
      const pending = await storeCeremony(defaultWebauthnSetupCeremonyDto({ tab_id: TAB_ID }));

      const promise = service.handleResult(OTHER_TAB_ID, successResult(pending));

      await expect(promise).rejects.toThrow(WebauthnCeremonyNotFoundError);
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toEqual(pending);
      expect(appWorker.port.emit).not.toHaveBeenCalled();
    });

    it("rejects if no ceremony is pending", async () => {
      expect.assertions(1);
      await expect(service.handleResult(TAB_ID, { id: "x", status: "success" })).rejects.toThrow(
        WebauthnCeremonyNotFoundError,
      );
    });

    it("removes an expired ceremony and notifies the app worker of the expiry", async () => {
      expect.assertions(2);
      const expired = await storeCeremony(expiredWebauthnSetupCeremonyDto({ tab_id: TAB_ID }));

      await service.handleResult(TAB_ID, successResult(expired));

      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
      expect(appWorker.port.emit).toHaveBeenCalledWith(DONE_EVENT, {
        success: false,
        result: new WebauthnCeremonyNotFoundError("The pending passkey ceremony has expired."),
      });
    });

    it("rejects an invalid credential and keeps the ceremony pending", async () => {
      expect.assertions(3);
      const pending = await storeCeremony(defaultWebauthnSetupCeremonyDto({ tab_id: TAB_ID }));
      const credential = defaultWebauthnRegistrationResponseDto({ type: "password" });

      await expect(service.handleResult(TAB_ID, successResult(pending, { credential }))).rejects.toThrow(
        EntityValidationError,
      );
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toEqual(pending);
      expect(appWorker.port.emit).not.toHaveBeenCalled();
    });
  });

  describe("WebauthnSetupCeremonyService::finish", () => {
    it("posts the stored credential and removes the ceremony", async () => {
      expect.assertions(3);
      const pending = await storeCeremony(webauthnSetupCeremonyWithCredentialDto({ tab_id: TAB_ID }));
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/finish\.json/, async (req) => {
        expect(await req.json()).toEqual({
          handle: pending.handle,
          credential: defaultWebauthnRegistrationResponseDto(),
          name: "My passkey",
        });
        return mockApiResponse({ verified: "2026-07-27T00:57:56+00:00" });
      });

      expect(await service.finish(TAB_ID, "My passkey")).toEqual({ verified: "2026-07-27T00:57:56+00:00" });
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
    });

    it("rejects if no ceremony is pending", async () => {
      expect.assertions(1);
      await expect(service.finish(TAB_ID, "My passkey")).rejects.toThrow(WebauthnCeremonyNotFoundError);
    });

    it("rejects if the pending ceremony has no credential yet", async () => {
      expect.assertions(1);
      await storeCeremony(defaultWebauthnSetupCeremonyDto({ tab_id: TAB_ID }));
      await expect(service.finish(TAB_ID, "My passkey")).rejects.toThrow(WebauthnCeremonyNotFoundError);
    });

    it("rejects if the pending ceremony belongs to another tab", async () => {
      expect.assertions(1);
      await storeCeremony(webauthnSetupCeremonyWithCredentialDto({ tab_id: OTHER_TAB_ID }));
      await expect(service.finish(TAB_ID, "My passkey")).rejects.toThrow(WebauthnCeremonyNotFoundError);
    });

    it("removes an expired ceremony and rejects", async () => {
      expect.assertions(2);
      await storeCeremony(expiredWebauthnSetupCeremonyDto({ tab_id: TAB_ID }));
      await expect(service.finish(TAB_ID, "My passkey")).rejects.toThrow(WebauthnCeremonyNotFoundError);
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
    });

    it("keeps the ceremony on a name error so the finish can be retried with another name", async () => {
      expect.assertions(2);
      const pending = await storeCeremony(webauthnSetupCeremonyWithCredentialDto({ tab_id: TAB_ID }));
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/finish\.json/, () =>
        mockApiResponseError(400, "Could not validate the data.", { name: { unique: "The name is already used." } }),
      );

      await expect(service.finish(TAB_ID, "My passkey")).rejects.toThrow(PassboltApiFetchError);
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toEqual(pending);
    });

    it("removes the ceremony and rejects with a not found error if the API rejects the handle as expired", async () => {
      expect.assertions(2);
      await storeCeremony(webauthnSetupCeremonyWithCredentialDto({ tab_id: TAB_ID }));
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/finish\.json/, () =>
        mockApiResponseError(400, "The authentication token is not valid.", {
          token: { expired: "The token is expired." },
        }),
      );

      await expect(service.finish(TAB_ID, "My passkey")).rejects.toThrow(WebauthnCeremonyNotFoundError);
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
    });

    it("removes the ceremony on any other API error", async () => {
      expect.assertions(2);
      await storeCeremony(webauthnSetupCeremonyWithCredentialDto({ tab_id: TAB_ID }));
      fetch.doMockOnceIf(/mfa\/setup\/webauthn\/finish\.json/, () =>
        mockApiResponseError(400, "The handle is invalid, expired, or already consumed."),
      );

      await expect(service.finish(TAB_ID, "My passkey")).rejects.toThrow(PassboltApiFetchError);
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
    });
  });

  describe("WebauthnSetupCeremonyService::abort", () => {
    it("removes the ceremony and tells the content script to abort", async () => {
      expect.assertions(2);
      const pending = await storeCeremony(defaultWebauthnSetupCeremonyDto({ tab_id: TAB_ID }));

      await service.abort(TAB_ID);

      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
      expect(appBootstrapWorker.port.emit).toHaveBeenCalledWith(ABORT_EVENT, { id: pending.id });
    });

    it("does nothing if no ceremony is pending on the tab", async () => {
      expect.assertions(2);
      const pending = await storeCeremony(defaultWebauthnSetupCeremonyDto({ tab_id: OTHER_TAB_ID }));

      await service.abort(TAB_ID);

      expect(await WebauthnSetupCeremonySessionStorageService.get()).toEqual(pending);
      expect(appBootstrapWorker.port.emit).not.toHaveBeenCalled();
    });

    it("removes the ceremony even if the content script worker cannot be found", async () => {
      expect.assertions(2);
      await storeCeremony(defaultWebauthnSetupCeremonyDto({ tab_id: TAB_ID }));
      WorkerService.get.mockRejectedValue(new Error("Could not find worker AppBootstrap for tab 1."));

      await expect(service.abort(TAB_ID)).resolves.toBeUndefined();
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
    });
  });
});
