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
 * @since         4.2.0
 */

import UserAbortsOperationError from "../../error/userAbortsOperationError";
import AccountEntity from "../../model/entity/account/accountEntity";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import GetPassphraseService from "./getPassphraseService";
import {QuickAccessService} from "../../service/ui/quickAccess.service";
import WorkerService from "../worker/workerService";
import WorkersSessionStorage from "../sessionStorage/workersSessionStorage";
import PortManager from "../../sdk/port/portManager";
import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {v4 as uuid} from "uuid";
import UserRememberMeLatestChoiceEntity from "../../model/entity/rememberMe/userRememberMeLatestChoiceEntity";

jest.mock("../ui/quickAccess.service");
jest.mock("../session_storage/passphraseStorageService");
jest.mock("../crypto/decryptPrivateKeyService");
jest.mock("../../utils/openpgp/openpgpAssertions");

describe("GetPassphraseService", () => {
  const userData = pgpKeys.ada;
  const expectedPassphrase = userData.passphrase;
  const account = new AccountEntity(defaultAccountDto());
  const passphraseRequestResponse = {
    passphrase: expectedPassphrase,
    rememberMe: 400
  };

  beforeEach(async() => {
    jest.clearAllMocks();
    jest.resetModules();
    await MockExtension.withConfiguredAccount(userData);
  });

  const waitFor = () => () => new Promise(resolve => setTimeout(resolve, 0));

  const getTestWorker = () => {
    const tab = {id: 1};
    const worker = {
      tab: tab,
      port: new MockPort()
    };
    //@todo: put this on styleguide MockPort.js instead
    worker.port._port = {
      onDisconnect: {
        addListener: callback => worker.port.addRequestListener("disconnect", callback)
      },
      sender: {tab: tab}
    };
    worker.port.simulateDisconnect = () => worker.port.request("disconnect");
    worker.port.addRequestListener("passbolt.passphrase.request", async() => passphraseRequestResponse);

    return worker;
  };

  describe("GetPassphraseService::getPassphrase", () => {
    it("should return the user's private key's passphrase that the user entered when the local storage is empty", async() => {
      expect.assertions(2);
      const worker = getTestWorker();
      PassphraseStorageService.get.mockImplementation(async() => null);
      const service = new GetPassphraseService(account);
      const receivedPassphrase = await service.getPassphrase(worker);

      expect(receivedPassphrase).toStrictEqual(expectedPassphrase);
      expect(PassphraseStorageService.get).toHaveBeenCalledTimes(1);
    });

    it("should return the user's private key's passphrase stored in the local storage", async() => {
      expect.assertions(2);
      const worker = getTestWorker();
      PassphraseStorageService.get.mockImplementation(async() => expectedPassphrase);
      worker.port.addRequestListener("passbolt.passphrase.request", () => { throw new Error("Should not be called during this test"); });
      const service = new GetPassphraseService(account);
      const receivedPassphrase = await service.getPassphrase(worker);

      expect(receivedPassphrase).toStrictEqual(expectedPassphrase);
      expect(PassphraseStorageService.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("GetPassphraseService::requestPassphrase", () => {
    it("should call `passbolt.passphrase.request` to retrieve passphrase from a user input", async() => {
      expect.assertions(1);
      const worker = getTestWorker();
      const service = new GetPassphraseService(account);
      const receivedPassphrase = await service.requestPassphrase(worker);

      expect(receivedPassphrase).toStrictEqual(expectedPassphrase);
    });

    it("should throw an exception if the user doesn't input its passphrase", async() => {
      expect.assertions(1);
      const expectedError = new UserAbortsOperationError();
      const worker = getTestWorker();
      worker.port.addRequestListener("passbolt.passphrase.request", () => { throw expectedError; });
      const service = new GetPassphraseService(account);
      try {
        await service.requestPassphrase(worker);
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
    });
  });

  describe("GetPassphraseService::requestPassphraseFromQuickAccess", () => {
    jest.spyOn(WorkerService, "waitExists");
    jest.spyOn(WorkersSessionStorage, "getWorkersByNameAndTabId");
    jest.spyOn(PortManager, "isPortExist");
    jest.spyOn(PortManager, "getPortById");

    it("should abort the operation if the quickaccess port is disconnected", async() => {
      expect.assertions(1);
      const quickAccessWorker = getTestWorker();

      WorkerService.waitExists.mockImplementation(() => {});
      PassphraseStorageService.get.mockImplementation(async() => null);
      PortManager.isPortExist.mockImplementation(async() => true);
      PortManager.getPortById.mockImplementation(async() => quickAccessWorker.port);
      WorkersSessionStorage.getWorkersByNameAndTabId.mockImplementation(async() => [quickAccessWorker]);

      const service = new GetPassphraseService(account);

      const receivedPassphrasePromise = service.requestPassphraseFromQuickAccess();
      await waitFor()();
      quickAccessWorker.port.simulateDisconnect();

      try {
        await receivedPassphrasePromise;
      } catch (e) {
        expect(e).toBeInstanceOf(UserAbortsOperationError);
      }
    });

    it("should get the passphrase from the quickaccess in detached mode", async() => {
      expect.assertions(2);
      const quickAccessWorker = getTestWorker();
      const expectedTabId = uuid();
      const mockedPopupWindow = {
        tabs: [{id: expectedTabId}]
      };
      let requestId = null;

      PassphraseStorageService.get.mockImplementation(async() => null);
      WorkerService.waitExists.mockImplementation(() => {});
      WorkersSessionStorage.getWorkersByNameAndTabId.mockImplementation(async() => [quickAccessWorker]);
      PortManager.isPortExist.mockImplementation(async() => true);
      PortManager.getPortById.mockImplementation(async() => quickAccessWorker.port);

      QuickAccessService.openInDetachedMode.mockImplementation(popupParameters => {
        const expectedParameters = [
          {name: "uiMode", value: "detached"},
          {name: "feature", value: "request-passphrase"},
          {name: "requestId", value: expect.any(String)}
        ];

        expect(popupParameters).toStrictEqual(expectedParameters);

        requestId = popupParameters[2].value;
        return mockedPopupWindow;
      });


      const service = new GetPassphraseService(account);

      const receivedPassphrasePromise = service.requestPassphraseFromQuickAccess();
      await waitFor()();

      //@todo: to be fixed on styleguide and use it the proper way instead;
      quickAccessWorker.port.emitListener[requestId]("SUCCESS", passphraseRequestResponse);
      const receivedPassphrase = await receivedPassphrasePromise;

      expect(receivedPassphrase).toStrictEqual(expectedPassphrase);
    });

    it("should not open the quickacces if the the passphrase is registered locally", async() => {
      expect.assertions(2);
      const worker = getTestWorker();
      worker.port.addRequestListener("passbolt.passphrase.request", () => { throw new Error("Should not be called during this test"); });
      PassphraseStorageService.get.mockImplementation(async() => expectedPassphrase);
      const service = new GetPassphraseService(account);
      const receivedPassphrase = await service.requestPassphraseFromQuickAccess();

      expect(receivedPassphrase).toStrictEqual(expectedPassphrase);
      expect(QuickAccessService.openInDetachedMode).not.toHaveBeenCalled();
    });
  });

  describe("GetPassphraseService::rememberPassphrase", () => {
    it("should call the storage service to remember the session", async() => {
      expect.assertions(4);
      const service = new GetPassphraseService(account);
      const setStorageSpy = jest.spyOn(service.userRememberMeLatestChoiceStorage, "set");

      const passphraseToRemember = "passphrase to remember";
      const durationForRememberance = -1;
      const expectedEntityToSave = new UserRememberMeLatestChoiceEntity({duration: durationForRememberance});
      await service.rememberPassphrase(passphraseToRemember, durationForRememberance);

      expect(PassphraseStorageService.set).toHaveBeenCalledTimes(1);
      expect(PassphraseStorageService.set).toHaveBeenCalledWith(passphraseToRemember, durationForRememberance);
      expect(setStorageSpy).toHaveBeenCalledTimes(1);
      expect(setStorageSpy).toHaveBeenCalledWith(expectedEntityToSave);
    });


    it("should not remember the session if the duration session is not formatted properly", async() => {
      expect.assertions(2);
      const service = new GetPassphraseService(account);
      const setStorageSpy = jest.spyOn(service.userRememberMeLatestChoiceStorage, "set");

      const passphraseToRemember = "passphrase to remember";
      const durationForRememberance = "wrong value";
      await service.rememberPassphrase(passphraseToRemember, durationForRememberance);

      expect(PassphraseStorageService.set).not.toHaveBeenCalled();
      expect(setStorageSpy).not.toHaveBeenCalled();
    });
  });

  describe("GetPassphraseService::validatePassphrase", () => {
    it("should validate the passphrase with the current user's private key", async() => {
      expect.assertions(2);
      const service = new GetPassphraseService(account);
      await service.validatePassphrase(expectedPassphrase);

      expect(OpenpgpAssertion.readKeyOrFail).toHaveBeenCalledTimes(1);
      expect(DecryptPrivateKeyService.decrypt).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if the passphrase is not properly formatted", async() => {
      expect.assertions(1);
      const expectedError = new Error("The given parameter should be a valid UTF8 string.");
      const service = new GetPassphraseService(account);
      try {
        await service.validatePassphrase({data: 1234567890});
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
    });
  });
});
