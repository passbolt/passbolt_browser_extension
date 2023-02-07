/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.3
 */
import "../../../../../test/mocks/mockSsoDataStorage";
import "../../../../../test/mocks/mockCryptoKey";
import {v4 as uuidv4} from "uuid";
import {pgpKeys} from "../../../../../test/fixtures/pgpKeys/keys";
import MockExtension from "../../../../../test/mocks/mockExtension";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import DecryptPrivateKeyService from "../../service/crypto/decryptPrivateKeyService";
import UpdatePrivateKeyController from "./updatePrivateKeyController";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import FileService from "../../service/file/fileService";
import SsoDataStorage from "../../service/indexedDB_storage/ssoDataStorage";
import {clientSsoKit} from "../../model/entity/sso/ssoKitClientPart.test.data";
import GenerateSsoKitService from "../../service/sso/generateSsoKitService";
import {anonymousOrganizationSettings} from "../../model/entity/organizationSettings/organizationSettingsEntity.test.data";
import {mockApiResponse, mockApiResponseError} from "../../../../../test/mocks/mockApiResponse";
import {enableFetchMocks} from "jest-fetch-mock";
import SsoKitClientPartEntity from "../../model/entity/sso/ssoKitClientPartEntity";
import SsoKitServerPartEntity from "../../model/entity/sso/ssoKitServerPartEntity";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";
import InvalidMasterPasswordError from "../../error/invalidMasterPasswordError";
import {generateSsoKitServerData} from "../../model/entity/sso/ssoKitServerPart.test.data";

const mockedSaveFile = jest.spyOn(FileService, "saveFile");

beforeEach(() => {
  enableFetchMocks();
  jest.clearAllMocks();
  fetch.resetMocks();
});

describe("UpdatePrivateKeyController", () => {
  const mockOrganisationSettingCall = (ssoEnabled = false) => {
    const organizationSettings = anonymousOrganizationSettings();
    if (ssoEnabled) {
      organizationSettings.passbolt.plugins.sso = {enabled: true};
    }
    fetch.doMockOnceIf(new RegExp('/settings.json'), () => mockApiResponse(organizationSettings, {servertime: Date.now() / 1000}));
  };

  describe("UpdatePrivateKeyController::exec", () => {
    const data = generateSsoKitServerData({});
    const dto = {data};

    it("Should trigger the download of the recovery kit with the new passphrase.", async() => {
      expect.assertions(4);

      await MockExtension.withConfiguredAccount();
      mockOrganisationSettingCall();
      mockedSaveFile.mockImplementation(async(fileName, fileContent, fileContentType, workerTabId) => {
        expect(fileName).toStrictEqual("passbolt-recovery-kit.asc");
        expect(fileContentType).toStrictEqual("text/plain");
        expect(workerTabId).toStrictEqual(worker.tab.id);

        const key = await OpenpgpAssertion.readKeyOrFail(fileContent);
        OpenpgpAssertion.assertEncryptedPrivateKey(key);

        const decryptedPrivateKey = await DecryptPrivateKeyService.decrypt(key, newPassphrase);
        expect(decryptedPrivateKey).toBeTruthy();
      });

      const worker = {
        tab: {
          id: uuidv4()
        }
      };

      const controller = new UpdatePrivateKeyController(worker, null, defaultApiClientOptions());
      const oldPassphrase = pgpKeys.ada.passphrase;
      const newPassphrase = "newPassphrase";
      await controller.exec(oldPassphrase, newPassphrase);
    });

    it("Should throw an error if no passphrase is provided.", async() => {
      expect.assertions(2);
      await MockExtension.withConfiguredAccount();
      const controller = new UpdatePrivateKeyController(null, null, defaultApiClientOptions());

      const nullPassphrase = null;
      const stringPassphrase = "stringPassphrase";
      const expectedError = new Error("The old and new passphrase have to be string");
      try {
        await controller.exec(nullPassphrase, stringPassphrase);
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }

      try {
        await controller.exec(stringPassphrase, nullPassphrase);
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
    });

    it("Should throw an error if passphrases are not strings.", async() => {
      expect.assertions(2);
      await MockExtension.withConfiguredAccount();
      const controller = new UpdatePrivateKeyController(null, null, defaultApiClientOptions());

      const notStringPassphrase = {};
      const stringPassphrase = "stringPassphrase";
      const expectedError = new Error("The old and new passphrase have to be string");
      try {
        await controller.exec(notStringPassphrase, stringPassphrase);
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }

      try {
        await controller.exec(stringPassphrase, notStringPassphrase);
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
    });

    it("Should update the local SSO kit if one already exists.", async() => {
      expect.assertions(2);
      const newPassphrase = "newPassphrase";
      const ssoKit = clientSsoKit();
      const newSsoKitId = uuidv4();
      const newSsoKit = new SsoKitClientPartEntity(clientSsoKit({id: newSsoKitId}));
      const worker = {
        tab: {
          id: uuidv4()
        }
      };

      await MockExtension.withConfiguredAccount();
      SsoDataStorage.setMockedData(ssoKit);

      expect.assertions(3);

      mockOrganisationSettingCall(true);
      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoKit.id}.json`), () => mockApiResponse({}));
      fetch.doMockOnceIf(new RegExp('/sso/keys.json'), () => mockApiResponse({id: newSsoKitId, data: data}));

      jest.spyOn(GenerateSsoKitService, "generateSsoKits").mockImplementation((passphrase, providerId) => {
        expect(passphrase).toBe(newPassphrase);
        expect(providerId).toBe(ssoKit.provider);

        return {
          serverPart: new SsoKitServerPartEntity(dto),
          clientPart: newSsoKit,
        };
      });

      SsoDataStorage.save.mockImplementation(kit => {
        expect(kit).toBe(newSsoKit);
      });

      mockedSaveFile.mockImplementation(async() => {});

      const controller = new UpdatePrivateKeyController(worker, null, defaultApiClientOptions());
      const oldPassphrase = pgpKeys.ada.passphrase;
      await controller.exec(oldPassphrase, newPassphrase);
    });

    it("Should not create a local SSO kit if none exists.", async() => {
      expect.assertions(2);
      const worker = {
        tab: {
          id: uuidv4()
        }
      };

      await MockExtension.withConfiguredAccount();
      SsoDataStorage.setMockedData(null);

      expect.assertions(2);
      mockOrganisationSettingCall(true);

      const shouldNotHaveBeenCalledError = new Error("This API request should not have been made");
      fetch.doMockOnceIf(new RegExp(`/sso/keys/[a-fA-F0-9-].*\.json`), () => { throw shouldNotHaveBeenCalledError; });
      fetch.doMockOnceIf(new RegExp('/sso/keys.json'), () => { throw shouldNotHaveBeenCalledError; });

      jest.spyOn(GenerateSsoKitService, "generateSsoKits");

      mockedSaveFile.mockImplementation(() => {});

      const controller = new UpdatePrivateKeyController(worker, null, defaultApiClientOptions());
      await controller.exec(pgpKeys.ada.passphrase, "newPassphrase");

      expect(GenerateSsoKitService.generateSsoKits).not.toHaveBeenCalled();
      expect(SsoDataStorage.save).not.toHaveBeenCalled();
    });

    it("Should not update the passsphrase if the kit can't be send to the server.", async() => {
      mockOrganisationSettingCall(true);
      const newPassphrase = "newPassphrase";
      const ssoKit = clientSsoKit();
      const newSsoKitId = uuidv4();
      const newSsoKit = new SsoKitClientPartEntity(clientSsoKit({id: newSsoKitId}));
      const worker = {
        tab: {
          id: uuidv4()
        }
      };

      await MockExtension.withConfiguredAccount();
      SsoDataStorage.setMockedData(ssoKit);

      expect.assertions(3);
      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoKit.id}.json`), () => mockApiResponse({}));

      const expectedError = new Error("Something went wrong");
      fetch.doMockOnceIf(new RegExp('/sso/keys.json'), () => { throw expectedError; });

      jest.spyOn(GenerateSsoKitService, "generateSsoKits").mockImplementation(() => ({
        serverPart: new SsoKitServerPartEntity(dto),
        clientPart: newSsoKit,
      }));
      jest.spyOn(PassphraseStorageService, "flushPassphrase");

      mockedSaveFile.mockImplementation(async() => {});

      const controller = new UpdatePrivateKeyController(worker, null, defaultApiClientOptions());
      const oldPassphrase = pgpKeys.ada.passphrase;
      try {
        await controller.exec(oldPassphrase, newPassphrase);
      } catch (_) { }

      expect(SsoDataStorage.save).not.toHaveBeenCalled();
      expect(PassphraseStorageService.flushPassphrase).not.toHaveBeenCalled();
      expect(mockedSaveFile).not.toHaveBeenCalled();
    });

    it("Should ignore the sso kit deletion on server side if it gets a 404.", async() => {
      const newPassphrase = "newPassphrase";
      const ssoKit = clientSsoKit();
      const newSsoKitId = uuidv4();
      const newSsoKit = new SsoKitClientPartEntity(clientSsoKit({id: newSsoKitId}));
      const worker = {
        tab: {
          id: uuidv4()
        }
      };

      await MockExtension.withConfiguredAccount();
      SsoDataStorage.setMockedData(ssoKit);

      expect.assertions(1);

      mockOrganisationSettingCall(true);
      fetch.doMockOnceIf(new RegExp(`/sso/keys/${ssoKit.id}.json`), () => mockApiResponseError(404));
      fetch.doMockOnceIf(new RegExp('/sso/keys.json'), () => mockApiResponse({id: newSsoKitId, data: data}));

      jest.spyOn(GenerateSsoKitService, "generateSsoKits").mockImplementation(() => ({
        serverPart: new SsoKitServerPartEntity(dto),
        clientPart: newSsoKit,
      }));

      SsoDataStorage.save.mockImplementation(kit => {
        expect(kit).toBe(newSsoKit);
      });

      mockedSaveFile.mockImplementation(async() => {});

      const controller = new UpdatePrivateKeyController(worker, null, defaultApiClientOptions());
      const oldPassphrase = pgpKeys.ada.passphrase;
      await controller.exec(oldPassphrase, newPassphrase);
    });

    it("Should not generate another SSO kit if the passphrase can't be rotated.", async() => {
      const newPassphrase = "newPassphrase";
      const ssoKit = clientSsoKit();
      const newSsoKitId = uuidv4();
      const newSsoKit = new SsoKitClientPartEntity(clientSsoKit({id: newSsoKitId}));
      const worker = {
        tab: {
          id: uuidv4()
        }
      };

      await MockExtension.withConfiguredAccount();
      SsoDataStorage.setMockedData(ssoKit);

      expect.assertions(4);

      mockOrganisationSettingCall(true);

      const shouldNotHaveBeenCalledError = new Error("This API request should not have been made");
      fetch.doMockOnceIf(new RegExp(`/sso/keys/[a-fA-F0-9-].*\.json`), () => { throw shouldNotHaveBeenCalledError; });
      fetch.doMockOnceIf(new RegExp('/sso/keys.json'), () => { throw shouldNotHaveBeenCalledError; });

      jest.spyOn(GenerateSsoKitService, "generateSsoKits");

      SsoDataStorage.save.mockImplementation(kit => {
        expect(kit).toBe(newSsoKit);
      });

      mockedSaveFile.mockImplementation(async() => {});

      const controller = new UpdatePrivateKeyController(worker, null, defaultApiClientOptions());
      try {
        await controller.exec("wrong passphrase", newPassphrase);
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidMasterPasswordError);
      }

      expect(GenerateSsoKitService.generateSsoKits).not.toHaveBeenCalled();
      expect(SsoDataStorage.save).not.toHaveBeenCalled();
      expect(mockedSaveFile).not.toHaveBeenCalled();
    });
  });
});
