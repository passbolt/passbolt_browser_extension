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
 * @since         5.12.1
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import LaunchResourceController from "./launchResourceController";
import AutofillSettingsService from "../../service/autofill/autofillSettingsService";
import WorkerService from "../../service/worker/workerService";
import BrowserTabService from "../../service/ui/browserTab.service";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import EncryptMessageService from "../../service/crypto/encryptMessageService";
import { OpenpgpAssertion } from "../../utils/openpgp/openpgpAssertions";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { defaultResourceDto } from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import { resourceTypePasswordDescriptionTotpDto } from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import { minimalDto } from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity.test.data";
import SecretEntity from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity";
import { defaultTotpDto } from "../../model/entity/totp/totpDto.test.data";
import { pgpKeys } from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import { readWorker } from "../../model/entity/worker/workerEntity.test.data";
import { mockPort } from "../../sdk/port/portManager.test.data";
import Port from "../../sdk/port";
import { v4 as uuidv4 } from "uuid";

const account = new AccountEntity(defaultAccountDto());
const RESOURCE_ID = uuidv4();
const RESOURCE_URI = "https://example.com/login";
const RESOURCE_ORIGIN = "https://example.com";

/**
 * Build a controller with the worker port whose verified sender.url is `landedUrl`,
 * and stub the decrypt chain + navigation. Returns the controller, its worker port, and the resource.
 */
async function setup({ autofillOnLaunch = true, landedUrl = RESOURCE_URI, uri = RESOURCE_URI } = {}) {
  const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
  const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);
  const plaintextSecretDto = { totp: defaultTotpDto(), password: "password-test", description: "description-test" };
  const secretDto = minimalDto({ data: await EncryptMessageService.encrypt(JSON.stringify(plaintextSecretDto), publicKey) });
  const schema = resourceTypePasswordDescriptionTotpDto().definition.secret;

  const resource = defaultResourceDto();
  resource.metadata.uris = [uri];
  resource.metadata.username = "ada@passbolt.com";

  const callerWorker = readWorker();
  const controller = new LaunchResourceController(callerWorker, uuidv4(), defaultApiClientOptions(), account);

  // The web-integration worker on the destination tab; its sender.url is the trusted "landed" origin.
  const integrationPort = new Port(mockPort({ name: "WebIntegration", tabId: 42, url: landedUrl }));

  jest.spyOn(AutofillSettingsService, "get").mockResolvedValue({ autofillOnLaunch });
  jest.spyOn(WorkerService, "waitExists").mockResolvedValue(undefined);
  jest.spyOn(WorkerService, "get").mockResolvedValue({ port: integrationPort });
  jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockResolvedValue(privateKey);
  jest.spyOn(controller.resourceModel, "getById").mockResolvedValue(resource);
  jest.spyOn(controller.findSecretService, "findByResourceId").mockResolvedValue(new SecretEntity(secretDto));
  jest.spyOn(controller.resourceTypeModel, "getSecretSchemaById").mockResolvedValue(schema);
  jest
    .spyOn(controller.getPassphraseService, "requestPassphraseFromQuickAccess")
    .mockResolvedValue(pgpKeys.ada.passphrase);
  jest.spyOn(integrationPort, "request").mockResolvedValue("SUCCESS");

  // Navigation: a non-blank opener tab so navigateToUri opens a new tab (id 42).
  jest.spyOn(BrowserTabService, "getById").mockResolvedValue({ id: 7, url: "https://other.com" });
  global.browser.tabs.create = jest.fn().mockResolvedValue({ id: 42 });
  global.browser.tabs.update = jest.fn().mockResolvedValue({ id: 7 });

  return { controller, integrationPort, resource, plaintextSecretDto };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("LaunchResourceController", () => {
  describe("::exec", () => {
    it("rejects an invalid (non-uuid) resource id before doing any work", async () => {
      expect.assertions(3);
      const { controller } = await setup();

      await expect(controller.exec("not-a-uuid", 7)).rejects.toThrow("not a valid identifier");
      // Boundary validation happens before reading settings or the resource.
      expect(AutofillSettingsService.get).not.toHaveBeenCalled();
      expect(controller.resourceModel.getById).not.toHaveBeenCalled();
    });

    it("refuses to decrypt or fill when the loaded page origin does not match the resource origin", async () => {
      expect.assertions(3);
      const { controller, integrationPort } = await setup({ landedUrl: "https://evil.com/login" });

      await expect(controller.exec(RESOURCE_ID, 7)).rejects.toThrow("does not match the resource");
      // No decryption and no fill on mismatch.
      expect(controller.findSecretService.findByResourceId).not.toHaveBeenCalled();
      expect(integrationPort.request).not.toHaveBeenCalled();
    });

    it("throws and does nothing when autofill on launch is disabled", async () => {
      expect.assertions(2);
      const { controller } = await setup({ autofillOnLaunch: false });

      await expect(controller.exec(RESOURCE_ID, 7)).rejects.toThrow("Autofill on launch is not enabled");
      expect(controller.resourceModel.getById).not.toHaveBeenCalled();
    });

    it("rejects a non-https resource URL before navigating", async () => {
      expect.assertions(2);
      const { controller } = await setup({ uri: "http://insecure.example.com/login" });

      await expect(controller.exec(RESOURCE_ID, 7)).rejects.toThrow("valid https URL");
      expect(WorkerService.waitExists).not.toHaveBeenCalled();
    });

    it("fills the matching page and never submits, re-checking the origin before dispatch", async () => {
      expect.assertions(4);
      const { controller, integrationPort, plaintextSecretDto } = await setup({ landedUrl: RESOURCE_URI });

      await controller.exec(RESOURCE_ID, 7);

      // Origin re-checked at dispatch time (TOCTOU): WorkerService.get called for the initial check and again before fill.
      expect(WorkerService.get).toHaveBeenCalledTimes(2);
      expect(integrationPort.request).toHaveBeenCalledTimes(1);
      expect(integrationPort.request).toHaveBeenCalledWith(
        "passbolt.quickaccess.fill-form",
        "ada@passbolt.com",
        plaintextSecretDto.password,
        plaintextSecretDto.totp,
        RESOURCE_URI,
      );
      // The fill message carries no auto-submit flag (auto-login was cut).
      expect(integrationPort.request.mock.calls[0]).toHaveLength(5);
    });
  });

  describe("::navigateToUri", () => {
    it("reuses the opener tab when it is blank", async () => {
      const { controller } = await setup();
      BrowserTabService.getById.mockResolvedValue({ id: 7, url: "about:blank" });

      const tabId = await controller.navigateToUri(RESOURCE_URI, 7);

      expect(global.browser.tabs.update).toHaveBeenCalledWith(7, { url: RESOURCE_URI });
      expect(global.browser.tabs.create).not.toHaveBeenCalled();
      expect(tabId).toBe(7);
    });

    it("opens a new tab when the opener tab is a real http(s) page", async () => {
      const { controller } = await setup();
      BrowserTabService.getById.mockResolvedValue({ id: 7, url: "https://other.com" });

      const tabId = await controller.navigateToUri(RESOURCE_URI, 7);

      expect(global.browser.tabs.create).toHaveBeenCalledWith({ url: RESOURCE_URI });
      expect(tabId).toBe(42);
    });
  });

  describe("::resolveTargetTab", () => {
    it("returns the opener tab when it resolves by id", async () => {
      const { controller } = await setup();
      BrowserTabService.getById.mockResolvedValue({ id: 7, url: "about:blank" });

      const tab = await controller.resolveTargetTab(7);

      expect(tab).toEqual({ id: 7, url: "about:blank" });
    });

    it("falls back to the active tab query when the opener id does not resolve", async () => {
      const { controller } = await setup();
      BrowserTabService.getById.mockRejectedValue(new Error("No tab with id"));
      global.browser.tabs.query = jest.fn().mockResolvedValue([{ id: 99, url: "https://active.example.com" }]);

      const tab = await controller.resolveTargetTab(7);

      expect(BrowserTabService.getById).toHaveBeenCalledWith(7);
      expect(tab).toEqual({ id: 99, url: "https://active.example.com" });
    });

    it("queries the active tab directly when no opener id is provided", async () => {
      const { controller } = await setup();
      global.browser.tabs.query = jest.fn().mockResolvedValue([{ id: 99, url: "https://active.example.com" }]);

      const tab = await controller.resolveTargetTab(undefined);

      expect(BrowserTabService.getById).not.toHaveBeenCalled();
      expect(tab).toEqual({ id: 99, url: "https://active.example.com" });
    });

    it("returns null when neither the opener id nor any active-tab query resolves", async () => {
      const { controller } = await setup();
      BrowserTabService.getById.mockRejectedValue(new Error("No tab with id"));
      global.browser.tabs.query = jest.fn().mockResolvedValue([]);

      const tab = await controller.resolveTargetTab(7);

      expect(tab).toBeNull();
    });
  });

  describe("::_exec", () => {
    it("sanitises non-abort errors before emitting to the popup", async () => {
      expect.assertions(2);
      const emit = jest.fn();
      const controller = new LaunchResourceController({ port: { emit } }, "req-1", defaultApiClientOptions(), account);
      jest.spyOn(AutofillSettingsService, "get").mockResolvedValue({ autofillOnLaunch: false });
      jest.spyOn(console, "error").mockImplementation(() => {});

      await controller._exec(RESOURCE_ID, 7);

      const emitted = emit.mock.calls.find((call) => call[1] === "ERROR");
      expect(emitted).toBeDefined();
      // Generic message, not the internal "Autofill on launch is not enabled." detail.
      expect(emitted[2].message).toBe("Unable to launch and autofill the resource.");
    });
  });
});
