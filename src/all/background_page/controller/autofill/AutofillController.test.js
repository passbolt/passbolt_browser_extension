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
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {readWorker} from "../../model/entity/worker/workerEntity.test.data";
import InformMenuPagemod from "../../pagemod/informMenuPagemod";
import {v4 as uuidv4} from "uuid";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import GetDecryptedUserPrivateKeyService from "../../service/account/getDecryptedUserPrivateKeyService";
import DecryptAndParseResourceSecretService from "../../service/secret/decryptAndParseResourceSecretService";
import WorkerService from "../../service/worker/workerService";
import {mockPort} from "../../sdk/port/portManager.test.data";
import Port from "../../sdk/port";
import QuickAccessPagemod from "../../pagemod/quickAccessPagemod";
import {minimalDto} from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity.test.data";
import SecretEntity from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity";

describe("AutofillController", () => {
  const account = new AccountEntity(defaultAccountDto());

  describe("AutofillController::exec", () => {
    it("Should autofill from inform menu.", async() => {
      expect.assertions(10);

      // initialisation
      const requestId = uuidv4();
      const worker = readWorker({name: InformMenuPagemod.appName});
      const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);
      const resource = defaultResourceDto();
      const secretDto = minimalDto();
      const secret = {password: "secret"};
      const port = mockPort({name: worker.id, tabId: worker.tabId, frameId: worker.frameId});
      const portWrapper = new Port(port);
      // mocked function
      jest.spyOn(WorkerService, "get").mockImplementationOnce(() => ({port: portWrapper}));
      jest.spyOn(controller.getPassphraseService, "requestPassphraseFromQuickAccess").mockImplementationOnce(() => pgpKeys.ada.passphrase);
      jest.spyOn(controller.resourceModel, "getById").mockImplementationOnce(() => resource);
      jest.spyOn(controller.findSecretService, "findByResourceId").mockImplementationOnce(() => new SecretEntity(secretDto));
      jest.spyOn(controller.resourceTypeModel, "getSecretSchemaById").mockImplementationOnce(jest.fn());
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementationOnce(() => pgpKeys.ada.private_decrypted);
      jest.spyOn(DecryptAndParseResourceSecretService, "decryptAndParse").mockImplementationOnce(() => secret);
      jest.spyOn(portWrapper, "emit");

      // process
      await controller.exec(resource.id, worker.tabId);

      // expectations
      expect(controller.getPassphraseService.requestPassphraseFromQuickAccess).toHaveBeenCalledTimes(1);
      expect(controller.resourceModel.getById).toHaveBeenCalledTimes(1);
      expect(controller.resourceModel.getById).toHaveBeenCalledWith(resource.id);
      expect(controller.findSecretService.findByResourceId).toHaveBeenCalledTimes(1);
      expect(controller.findSecretService.findByResourceId).toHaveBeenCalledWith(resource.id);
      expect(controller.resourceTypeModel.getSecretSchemaById).toHaveBeenCalledTimes(1);
      expect(controller.resourceTypeModel.getSecretSchemaById).toHaveBeenCalledWith(resource.resourceTypeId);
      expect(portWrapper.emit).toHaveBeenCalledTimes(2);
      expect(portWrapper.emit).toHaveBeenCalledWith('passbolt.web-integration.fill-credentials', {username: resource.metadata.username, password: secret.password});
      expect(portWrapper.emit).toHaveBeenCalledWith('passbolt.in-form-menu.close');
    });

    it("Should autofill from quickaccess.", async() => {
      expect.assertions(13);

      // initialisation
      const requestId = uuidv4();
      const worker = readWorker({name: QuickAccessPagemod.appName});
      const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);
      const resource = defaultResourceDto();
      const secretDto = minimalDto();
      const secret = {password: "secret"};
      const port = mockPort({name: worker.id, tabId: worker.tabId, frameId: worker.frameId, url: "https://url.com"});
      const portWrapper = new Port(port);
      const tab = {url: "https://url.com"};
      // mocked function
      jest.spyOn(WorkerService, "get").mockImplementationOnce(() => ({port: portWrapper, tab: tab}));
      jest.spyOn(controller.getPassphraseService, "requestPassphraseFromQuickAccess");
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockImplementationOnce(() => pgpKeys.ada.passphrase);
      jest.spyOn(controller.resourceModel, "getById").mockImplementationOnce(() => resource);
      jest.spyOn(controller.findSecretService, "findByResourceId").mockImplementationOnce(() => new SecretEntity(secretDto));
      jest.spyOn(controller.resourceTypeModel, "getSecretSchemaById").mockImplementationOnce(jest.fn());
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementationOnce(() => pgpKeys.ada.private_decrypted);
      jest.spyOn(DecryptAndParseResourceSecretService, "decryptAndParse").mockImplementationOnce(() => secret);
      jest.spyOn(portWrapper, "emit");
      jest.spyOn(portWrapper, "request");

      // process
      await controller.exec(resource.id, worker.tabId);

      // expectations
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
      expect(portWrapper.request).toHaveBeenCalledWith('passbolt.quickaccess.fill-form', resource.metadata.username, secret.password, tab.url);
      expect(portWrapper.emit).not.toHaveBeenCalledWith('passbolt.in-form-menu.close');
    });

    it("Should not autofill from a worker that is not inform menu or quickaccess.", async() => {
      expect.assertions(12);

      // initialisation
      const requestId = uuidv4();
      const worker = readWorker();
      const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);
      const resource = defaultResourceDto();
      const secretDto = minimalDto();
      const secret = {password: "secret"};
      const port = mockPort({name: worker.id, tabId: worker.tabId, frameId: worker.frameId});
      const portWrapper = new Port(port);
      const tab = {url: "https://url.com"};
      // mocked function
      jest.spyOn(WorkerService, "get").mockImplementationOnce(() => ({port: portWrapper, tab: tab}));
      jest.spyOn(controller.getPassphraseService, "requestPassphraseFromQuickAccess");
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockImplementationOnce(() => pgpKeys.ada.passphrase);
      jest.spyOn(controller.resourceModel, "getById").mockImplementationOnce(() => resource);
      jest.spyOn(controller.findSecretService, "findByResourceId").mockImplementationOnce(() => new SecretEntity(secretDto));
      jest.spyOn(controller.resourceTypeModel, "getSecretSchemaById").mockImplementationOnce(jest.fn());
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementationOnce(() => pgpKeys.ada.private_decrypted);
      jest.spyOn(DecryptAndParseResourceSecretService, "decryptAndParse").mockImplementationOnce(() => secret);
      jest.spyOn(portWrapper, "emit");
      jest.spyOn(portWrapper, "request");

      // process
      await controller.exec(resource.id, worker.tabId);

      // expectations
      expect(controller.getPassphraseService.requestPassphraseFromQuickAccess).not.toHaveBeenCalled();
      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledWith(worker);
      expect(controller.resourceModel.getById).toHaveBeenCalledTimes(1);
      expect(controller.resourceModel.getById).toHaveBeenCalledWith(resource.id);
      expect(controller.findSecretService.findByResourceId).toHaveBeenCalledTimes(1);
      expect(controller.findSecretService.findByResourceId).toHaveBeenCalledWith(resource.id);
      expect(controller.resourceTypeModel.getSecretSchemaById).toHaveBeenCalledTimes(1);
      expect(controller.resourceTypeModel.getSecretSchemaById).toHaveBeenCalledWith(resource.resourceTypeId);
      expect(portWrapper.emit).not.toHaveBeenCalledWith('passbolt.web-integration.fill-credentials', {username: resource.username, password: secret.password});
      expect(portWrapper.request).not.toHaveBeenCalledWith('passbolt.quickaccess.fill-form', resource.username, secret.password, tab.url);
      expect(portWrapper.emit).not.toHaveBeenCalledWith('passbolt.in-form-menu.close');
    });

    it("Should map username with empty string if not exist.", async() => {
      expect.assertions(12);

      // initialisation
      const requestId = uuidv4();
      const worker = readWorker();
      const controller = new AutofillController(worker, requestId, defaultApiClientOptions(), account);
      const resource = defaultResourceDto({
        username: null
      });
      const secretDto = minimalDto();
      const secret = {password: "secret"};
      const port = mockPort({name: worker.id, tabId: worker.tabId, frameId: worker.frameId});
      const portWrapper = new Port(port);
      const tab = {url: "https://url.com"};
      // mocked function
      jest.spyOn(WorkerService, "get").mockImplementationOnce(() => ({port: portWrapper, tab: tab}));
      jest.spyOn(controller.getPassphraseService, "requestPassphraseFromQuickAccess");
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockImplementationOnce(() => pgpKeys.ada.passphrase);
      jest.spyOn(controller.resourceModel, "getById").mockImplementationOnce(() => resource);
      jest.spyOn(controller.findSecretService, "findByResourceId").mockImplementationOnce(() => new SecretEntity(secretDto));
      jest.spyOn(controller.resourceTypeModel, "getSecretSchemaById").mockImplementationOnce(jest.fn());
      jest.spyOn(GetDecryptedUserPrivateKeyService, "getKey").mockImplementationOnce(() => pgpKeys.ada.private_decrypted);
      jest.spyOn(DecryptAndParseResourceSecretService, "decryptAndParse").mockImplementationOnce(() => secret);
      jest.spyOn(portWrapper, "emit");
      jest.spyOn(portWrapper, "request");

      // process
      await controller.exec(resource.id, worker.tabId);

      // expectations
      expect(controller.getPassphraseService.requestPassphraseFromQuickAccess).not.toHaveBeenCalled();
      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledWith(worker);
      expect(controller.resourceModel.getById).toHaveBeenCalledTimes(1);
      expect(controller.resourceModel.getById).toHaveBeenCalledWith(resource.id);
      expect(controller.findSecretService.findByResourceId).toHaveBeenCalledTimes(1);
      expect(controller.findSecretService.findByResourceId).toHaveBeenCalledWith(resource.id);
      expect(controller.resourceTypeModel.getSecretSchemaById).toHaveBeenCalledTimes(1);
      expect(controller.resourceTypeModel.getSecretSchemaById).toHaveBeenCalledWith(resource.resourceTypeId);
      expect(portWrapper.emit).not.toHaveBeenCalledWith('passbolt.web-integration.fill-credentials', {username: "", password: secret.password});
      expect(portWrapper.request).not.toHaveBeenCalledWith('passbolt.quickaccess.fill-form', "", secret.password, tab.url);
      expect(portWrapper.emit).not.toHaveBeenCalledWith('passbolt.in-form-menu.close');
    });
  });
});

