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
 * @since         4.6.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import AutofillController from "./AutofillController";
import { defaultAccountDto } from "../../model/entity/account/accountEntity.test.data";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { readWorker } from "../../model/entity/worker/workerEntity.test.data";
import InformMenuPagemod from "../../pagemod/informMenuPagemod";
import { v4 as uuidv4 } from "uuid";
import { pgpKeys } from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import { defaultResourceDto } from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import WorkerService from "../../service/worker/workerService";
import { mockPort } from "../../sdk/port/portManager.test.data";
import Port from "../../sdk/port";
import QuickAccessPagemod from "../../pagemod/quickAccessPagemod";
import { minimalDto } from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity.test.data";
import SecretEntity from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity";
import { defaultTotpDto } from "../../model/entity/totp/totpDto.test.data";
import EncryptMessageService from "../../service/crypto/encryptMessageService";
import { resourceTypePasswordDescriptionTotpDto } from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import { OpenpgpAssertion } from "../../utils/openpgp/openpgpAssertions";

describe("AutofillController", () => {
  const account = new AccountEntity(defaultAccountDto());

  describe("AutofillController::exec", () => {
    let resource, schema, plaintextSecretDto, secretDto;

    beforeEach(async () => {
      jest.resetModules();

      const publicKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
      const privateKey = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);

      resource = defaultResourceDto();
      schema = resourceTypePasswordDescriptionTotpDto().definition.secret;
      plaintextSecretDto = {
        totp: defaultTotpDto(),
        password: "password-test",
        description: "description-test",
      };
      secretDto = minimalDto({
        data: await EncryptMessageService.encrypt(JSON.stringify(plaintextSecretDto), publicKey),
      });

      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockResolvedValue(privateKey);
    });

    it("Should autofill from inform menu.", async () => {
      expect.assertions(10);

      const requestId = uuidv4();
      const worker = readWorker({ name: InformMenuPagemod.appName });
      const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);
      const port = mockPort({ name: worker.id, tabId: worker.tabId, frameId: worker.frameId });
      const portWrapper = new Port(port);

      jest.spyOn(WorkerService, "get").mockResolvedValueOnce({ port: portWrapper });
      jest.spyOn(portWrapper, "emit");
      jest
        .spyOn(controller.getPassphraseService, "requestPassphraseFromQuickAccess")
        .mockResolvedValue(pgpKeys.ada.passphrase);
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockResolvedValue(pgpKeys.ada.passphrase);
      jest.spyOn(controller.resourceModel, "getById").mockResolvedValue(resource);
      jest.spyOn(controller.findSecretService, "findByResourceId").mockResolvedValue(new SecretEntity(secretDto));
      jest.spyOn(controller.resourceTypeModel, "getSecretSchemaById").mockResolvedValue(schema);

      await controller.exec(resource.id, worker.tabId);

      expect(controller.getPassphraseService.requestPassphraseFromQuickAccess).toHaveBeenCalledTimes(1);

      expect(controller.resourceModel.getById).toHaveBeenCalledTimes(1);
      expect(controller.resourceModel.getById).toHaveBeenCalledWith(resource.id);

      expect(controller.findSecretService.findByResourceId).toHaveBeenCalledTimes(1);
      expect(controller.findSecretService.findByResourceId).toHaveBeenCalledWith(resource.id);

      expect(controller.resourceTypeModel.getSecretSchemaById).toHaveBeenCalledTimes(1);
      expect(controller.resourceTypeModel.getSecretSchemaById).toHaveBeenCalledWith(resource.resourceTypeId);

      expect(portWrapper.emit).toHaveBeenCalledTimes(2);
      expect(portWrapper.emit).toHaveBeenCalledWith("passbolt.web-integration.fill-credentials", {
        username: resource.metadata.username,
        password: plaintextSecretDto.password,
        totp: plaintextSecretDto.totp,
      });
      expect(portWrapper.emit).toHaveBeenCalledWith("passbolt.in-form-menu.close");
    });

    it("Should autofill from quickaccess.", async () => {
      expect.assertions(13);

      const requestId = uuidv4();
      const worker = readWorker({ name: QuickAccessPagemod.appName });
      const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);
      const port = mockPort({ name: worker.id, tabId: worker.tabId, frameId: worker.frameId, url: "https://url.com" });
      const portWrapper = new Port(port);
      const tab = { url: "https://url.com" };

      jest.spyOn(WorkerService, "get").mockResolvedValueOnce({ port: portWrapper });
      jest.spyOn(portWrapper, "emit");
      jest.spyOn(portWrapper, "request");
      jest
        .spyOn(controller.getPassphraseService, "requestPassphraseFromQuickAccess")
        .mockResolvedValue(pgpKeys.ada.passphrase);
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockResolvedValue(pgpKeys.ada.passphrase);
      jest.spyOn(controller.resourceModel, "getById").mockResolvedValue(resource);
      jest.spyOn(controller.findSecretService, "findByResourceId").mockResolvedValue(new SecretEntity(secretDto));
      jest.spyOn(controller.resourceTypeModel, "getSecretSchemaById").mockResolvedValue(schema);

      await controller.exec(resource.id, worker.tabId);

      expect(controller.getPassphraseService.requestPassphraseFromQuickAccess).not.toHaveBeenCalled();
      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledWith(worker);

      expect(controller.resourceModel.getById).toHaveBeenCalledTimes(1);
      expect(controller.resourceModel.getById).toHaveBeenCalledWith(resource.id);

      expect(controller.findSecretService.findByResourceId).toHaveBeenCalledTimes(1);
      expect(controller.findSecretService.findByResourceId).toHaveBeenCalledWith(resource.id);

      expect(controller.resourceTypeModel.getSecretSchemaById).toHaveBeenCalledTimes(1);
      expect(controller.resourceTypeModel.getSecretSchemaById).toHaveBeenCalledWith(resource.resourceTypeId);

      expect(portWrapper.emit).toHaveBeenCalledTimes(1);
      expect(portWrapper.request).toHaveBeenCalledTimes(1);
      expect(portWrapper.request).toHaveBeenCalledWith(
        "passbolt.quickaccess.fill-form",
        resource.metadata.username,
        plaintextSecretDto.password,
        plaintextSecretDto.totp,
        tab.url,
      );
      expect(portWrapper.emit).not.toHaveBeenCalledWith("passbolt.in-form-menu.close");
    });

    it("Should not autofill from a worker that is not inform menu or quickaccess.", async () => {
      expect.assertions(12);

      const requestId = uuidv4();
      const worker = readWorker();
      const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);
      const port = mockPort({ name: worker.id, tabId: worker.tabId, frameId: worker.frameId });
      const portWrapper = new Port(port);
      const tab = { url: "https://url.com" };

      jest.spyOn(WorkerService, "get").mockResolvedValue({ port: portWrapper, tab: tab });
      jest.spyOn(portWrapper, "emit");
      jest.spyOn(portWrapper, "request");
      jest.spyOn(controller.getPassphraseService, "requestPassphraseFromQuickAccess");
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockResolvedValue(pgpKeys.ada.passphrase);
      jest.spyOn(controller.resourceModel, "getById").mockResolvedValue(resource);
      jest.spyOn(controller.findSecretService, "findByResourceId").mockResolvedValue(new SecretEntity(secretDto));
      jest.spyOn(controller.resourceTypeModel, "getSecretSchemaById").mockResolvedValue(schema);

      await controller.exec(resource.id, worker.tabId);

      expect(controller.getPassphraseService.requestPassphraseFromQuickAccess).not.toHaveBeenCalled();

      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledWith(worker);

      expect(controller.resourceModel.getById).toHaveBeenCalledTimes(1);
      expect(controller.resourceModel.getById).toHaveBeenCalledWith(resource.id);

      expect(controller.findSecretService.findByResourceId).toHaveBeenCalledTimes(1);
      expect(controller.findSecretService.findByResourceId).toHaveBeenCalledWith(resource.id);

      expect(controller.resourceTypeModel.getSecretSchemaById).toHaveBeenCalledTimes(1);
      expect(controller.resourceTypeModel.getSecretSchemaById).toHaveBeenCalledWith(resource.resourceTypeId);

      expect(portWrapper.emit).not.toHaveBeenCalledWith("passbolt.web-integration.fill-credentials", {
        username: resource.username,
        password: plaintextSecretDto.password,
        totp: plaintextSecretDto.totp,
      });
      expect(portWrapper.request).not.toHaveBeenCalledWith(
        "passbolt.quickaccess.fill-form",
        resource.username,
        plaintextSecretDto.password,
        plaintextSecretDto.totp,
        tab.url,
      );
      expect(portWrapper.emit).not.toHaveBeenCalledWith("passbolt.in-form-menu.close");
    });

    it("Should map username with empty string if not exist.", async () => {
      expect.assertions(12);

      const requestId = uuidv4();
      const worker = readWorker();
      const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);
      const port = mockPort({ name: worker.id, tabId: worker.tabId, frameId: worker.frameId });
      const portWrapper = new Port(port);
      const tab = { url: "https://url.com" };

      jest.spyOn(WorkerService, "get").mockResolvedValue({ port: portWrapper, tab: tab });
      jest.spyOn(portWrapper, "emit");
      jest.spyOn(portWrapper, "request");
      jest.spyOn(controller.getPassphraseService, "requestPassphraseFromQuickAccess");
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockResolvedValue(pgpKeys.ada.passphrase);
      jest.spyOn(controller.resourceModel, "getById").mockResolvedValue(resource);
      jest.spyOn(controller.findSecretService, "findByResourceId").mockResolvedValue(new SecretEntity(secretDto));
      jest.spyOn(controller.resourceTypeModel, "getSecretSchemaById").mockResolvedValue(schema);

      await controller.exec(resource.id, worker.tabId);

      expect(controller.getPassphraseService.requestPassphraseFromQuickAccess).not.toHaveBeenCalled();
      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledWith(worker);

      expect(controller.resourceModel.getById).toHaveBeenCalledTimes(1);
      expect(controller.resourceModel.getById).toHaveBeenCalledWith(resource.id);

      expect(controller.findSecretService.findByResourceId).toHaveBeenCalledTimes(1);
      expect(controller.findSecretService.findByResourceId).toHaveBeenCalledWith(resource.id);

      expect(controller.resourceTypeModel.getSecretSchemaById).toHaveBeenCalledTimes(1);
      expect(controller.resourceTypeModel.getSecretSchemaById).toHaveBeenCalledWith(resource.resourceTypeId);

      expect(portWrapper.emit).not.toHaveBeenCalledWith("passbolt.web-integration.fill-credentials", {
        username: "",
        password: plaintextSecretDto.password,
        totp: plaintextSecretDto.totp,
      });
      expect(portWrapper.request).not.toHaveBeenCalledWith(
        "passbolt.quickaccess.fill-form",
        "",
        plaintextSecretDto.password,
        plaintextSecretDto.totp,
        tab.url,
      );
      expect(portWrapper.emit).not.toHaveBeenCalledWith("passbolt.in-form-menu.close");
    });
  });

  describe("AutofillController::getPassphrase", () => {
    it("Should return the passphrase from the worker", async () => {
      expect.assertions(4);

      const requestId = uuidv4();
      const worker = readWorker({ name: QuickAccessPagemod.appName });
      const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);

      jest.spyOn(controller.getPassphraseService, "requestPassphraseFromQuickAccess");
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockResolvedValue(pgpKeys.ada.passphrase);

      await expect(controller.getPassphrase()).resolves.toEqual(pgpKeys.ada.passphrase);

      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledWith(worker);

      expect(controller.getPassphraseService.requestPassphraseFromQuickAccess).not.toHaveBeenCalled();
    });

    it("Should return the passphrase from quickaccess", async () => {
      expect.assertions(3);

      const requestId = uuidv4();
      const worker = readWorker({ name: InformMenuPagemod.appName });
      const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);

      jest
        .spyOn(controller.getPassphraseService, "requestPassphraseFromQuickAccess")
        .mockResolvedValue(pgpKeys.ada.passphrase);
      jest.spyOn(controller.getPassphraseService, "getPassphrase");

      await expect(controller.getPassphrase()).resolves.toEqual(pgpKeys.ada.passphrase);

      expect(controller.getPassphraseService.requestPassphraseFromQuickAccess).toHaveBeenCalledTimes(1);
      expect(controller.getPassphraseService.getPassphrase).not.toHaveBeenCalled();
    });

    it("Should throw an error if the passphrase is not valid from worker", async () => {
      expect.assertions(4);

      const requestId = uuidv4();
      const worker = readWorker({ name: QuickAccessPagemod.appName });
      const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);
      const error = new Error();

      jest.spyOn(controller.getPassphraseService, "requestPassphraseFromQuickAccess");
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockRejectedValue(error);

      await expect(controller.getPassphrase()).rejects.toThrow(error);

      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledWith(worker);

      expect(controller.getPassphraseService.requestPassphraseFromQuickAccess).not.toHaveBeenCalled();
    });

    it("Should throw an error if the passphrase is not valid from quickaccess", async () => {
      expect.assertions(3);

      const requestId = uuidv4();
      const worker = readWorker({ name: InformMenuPagemod.appName });
      const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);
      const error = new Error();

      jest.spyOn(controller.getPassphraseService, "requestPassphraseFromQuickAccess").mockRejectedValue(error);
      jest.spyOn(controller.getPassphraseService, "getPassphrase");

      await expect(controller.getPassphrase()).rejects.toThrow(error);

      expect(controller.getPassphraseService.requestPassphraseFromQuickAccess).toHaveBeenCalledTimes(1);
      expect(controller.getPassphraseService.getPassphrase).not.toHaveBeenCalled();
    });
  });

  describe("AutofillController::fillCredentials", () => {
    let plaintextSecretDto;

    beforeEach(() => {
      jest.resetModules();

      plaintextSecretDto = {
        totp: defaultTotpDto(),
        username: "username-test",
        password: "password-test",
        description: "description-test",
      };
    });

    it("Should emit the event with the credentials from inform menu", () => {
      expect.assertions(2);

      const requestId = uuidv4();
      const worker = readWorker({ name: InformMenuPagemod.appName });
      const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);
      const port = mockPort({ name: worker.id, tabId: worker.tabId, frameId: worker.frameId });
      const portWrapper = new Port(port);

      jest.spyOn(portWrapper, "emit");
      jest.spyOn(portWrapper, "request");

      controller.fillCredentials({ port: portWrapper }, plaintextSecretDto);

      expect(portWrapper.emit).toHaveBeenCalledWith("passbolt.web-integration.fill-credentials", plaintextSecretDto);
      expect(portWrapper.request).not.toHaveBeenCalled();
    });

    it("Should request the event with the credentials from quickaccess", () => {
      expect.assertions(1);

      const requestId = uuidv4();
      const worker = readWorker({ name: QuickAccessPagemod.appName });
      const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);
      const url = "https://url.com";
      const port = mockPort({ name: worker.id, tabId: worker.tabId, frameId: worker.frameId, url });
      const portWrapper = new Port(port);

      jest.spyOn(portWrapper, "emit");
      jest.spyOn(portWrapper, "request");

      controller.fillCredentials({ port: portWrapper }, plaintextSecretDto);

      expect(portWrapper.request).toHaveBeenCalledWith(
        "passbolt.quickaccess.fill-form",
        plaintextSecretDto.username,
        plaintextSecretDto.password,
        plaintextSecretDto.totp,
        url,
      );
    });

    it("Should do nothing when worker is unknown", () => {
      expect.assertions(2);

      const requestId = uuidv4();
      const worker = readWorker();
      const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);
      const port = mockPort({ name: worker.id, tabId: worker.tabId, frameId: worker.frameId });
      const portWrapper = new Port(port);

      jest.spyOn(portWrapper, "emit");
      jest.spyOn(portWrapper, "request");

      controller.fillCredentials({ port: portWrapper }, plaintextSecretDto);

      expect(portWrapper.emit).not.toHaveBeenCalled();
      expect(portWrapper.request).not.toHaveBeenCalled();
    });
  });

  describe("Getters", () => {
    describe("AutofillController::isInformMenuWorker", () => {
      it("Should return true from inform menu", () => {
        expect.assertions(1);

        const requestId = uuidv4();
        const worker = readWorker({ name: InformMenuPagemod.appName });
        const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);

        expect(controller.isInformMenuWorker).toEqual(true);
      });

      it("Should return false from quickaccess", () => {
        expect.assertions(1);

        const requestId = uuidv4();
        const worker = readWorker({ name: QuickAccessPagemod.appName });
        const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);

        expect(controller.isInformMenuWorker).toEqual(false);
      });

      it("Should return false from unknown", () => {
        expect.assertions(1);

        const requestId = uuidv4();
        const worker = readWorker();
        const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);

        expect(controller.isInformMenuWorker).toEqual(false);
      });
    });

    describe("AutofillController::isQuickAccessWorker", () => {
      it("Should return true from quickaccess", () => {
        expect.assertions(1);

        const requestId = uuidv4();
        const worker = readWorker({ name: QuickAccessPagemod.appName });
        const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);

        expect(controller.isQuickAccessWorker).toEqual(true);
      });

      it("Should return false from inform menu", () => {
        expect.assertions(1);

        const requestId = uuidv4();
        const worker = readWorker({ name: InformMenuPagemod.appName });
        const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);

        expect(controller.isQuickAccessWorker).toEqual(false);
      });

      it("Should return false from unknown", () => {
        expect.assertions(1);

        const requestId = uuidv4();
        const worker = readWorker();
        const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);

        expect(controller.isQuickAccessWorker).toEqual(false);
      });
    });
  });
});
