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
 * @since         4.10.1
 */

import expect from "expect";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import SaveSessionKeysService from "./saveSessionKeysService";
import {
  sharedResourcesSessionKeys
} from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysCollection.test.data";
import SessionKeysCollection from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysCollection";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import UserPassphraseRequiredError from "passbolt-styleguide/src/shared/error/userPassphraseRequiredError";
import SessionKeysBundlesCollection
  from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection";
import {
  decryptedSessionKeysBundleDto,
  defaultSessionKeysBundleDto
} from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundleEntity.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SaveSessionKeysService", () => {
  let saveSessionKeysService, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    saveSessionKeysService = new SaveSessionKeysService(account, apiClientOptions);
  });

  afterEach(async() => {
    // flush account related storage before each test.
    saveSessionKeysService.sessionKeysBundlesSessionStorageService.flush();
  });

  describe("::save", () => {
    it("throws if parameters are not valid.", async() => {
      expect.assertions(5);
      await expect(() => saveSessionKeysService.save()).rejects.toThrow("The parameter \"sessionKeys\" should be a SessionKeysCollection.");
      await expect(() => saveSessionKeysService.save(42)).rejects.toThrow("The parameter \"sessionKeys\" should be a SessionKeysCollection.");
      await expect(() => saveSessionKeysService.save({})).rejects.toThrow("The parameter \"sessionKeys\" should be a SessionKeysCollection.");
      const sessionKeys = new SessionKeysCollection(sharedResourcesSessionKeys());
      await expect(() => saveSessionKeysService.save(sessionKeys, 42)).rejects.toThrow("The parameter \"passphrase\" should be a string.");
      const passphrase = pgpKeys.admin.passphrase;
      await expect(() => saveSessionKeysService.save(sessionKeys, passphrase, 42)).rejects.toThrow("The parameter \"retryUpdate\" should be a boolean.");
    });

    it("throws if the user passphrase is not passed or retrieved from the storage.", async() => {
      expect.assertions(1);
      const sessionKeys = new SessionKeysCollection(sharedResourcesSessionKeys());
      await expect(() => saveSessionKeysService.save(sessionKeys, null)).rejects.toThrow(UserPassphraseRequiredError);
    });

    it("save a new session keys bundle when none were yet persisted.", async() => {
      expect.assertions(2);
      const sessionKeysDto = sharedResourcesSessionKeys();
      const sessionKeys = new SessionKeysCollection(sessionKeysDto);

      // Mock the retrieval of existing session keys bundles.
      jest.spyOn(saveSessionKeysService.getOrFindSessionKeysService, "getOrFindAllBundles").mockImplementationOnce(() => new SessionKeysBundlesCollection());
      // Mock the creation of session keys bundle.
      let createRequestData;
      jest.spyOn(saveSessionKeysService.sessionKeysBundleApiService, "create").mockImplementationOnce(data => {
        createRequestData = data;
        return defaultSessionKeysBundleDto(data);
      });

      await saveSessionKeysService.save(sessionKeys, pgpKeys.ada.passphrase);

      expect(saveSessionKeysService.sessionKeysBundleApiService.create).toHaveBeenCalled();
      const expectedSerializedSessionKeysBundleData = JSON.stringify({object_type: "PASSBOLT_SESSION_KEYS", session_keys: sessionKeysDto});
      await expect(createRequestData.data).toDecryptAndEqualTo(pgpKeys.ada.private_decrypted, expectedSerializedSessionKeysBundleData, pgpKeys.ada.private_decrypted);
    });

    it("update the existing keys bundle with the new session keys.", async() => {
      expect.assertions(3);
      const existingSessionKeysBundleDto = decryptedSessionKeysBundleDto();
      const existingSessionsKeysBundlesDto = [existingSessionKeysBundleDto];
      const existingSessionKeysBundles = new SessionKeysBundlesCollection(existingSessionsKeysBundlesDto);
      const newSessionKeysDto = [...existingSessionKeysBundleDto.data.session_keys, ...sharedResourcesSessionKeys()];
      const newSessionKeys = new SessionKeysCollection(newSessionKeysDto);

      // Mock the retrieval of existing session keys bundles.
      jest.spyOn(saveSessionKeysService.getOrFindSessionKeysService, "getOrFindAllBundles").mockImplementationOnce(() => existingSessionKeysBundles);
      // Mock the update of session keys bundle.
      let createRequestId, createRequestData;
      jest.spyOn(saveSessionKeysService.sessionKeysBundleApiService, "update").mockImplementationOnce((id, data) => {
        createRequestId = id;
        createRequestData = data;
        return data;
      });

      await saveSessionKeysService.save(newSessionKeys, pgpKeys.ada.passphrase);

      expect(saveSessionKeysService.sessionKeysBundleApiService.update).toHaveBeenCalled();
      expect(createRequestId).toEqual(existingSessionKeysBundleDto.id);
      const expectedSerializedSessionKeysBundleData = JSON.stringify({object_type: "PASSBOLT_SESSION_KEYS", session_keys: newSessionKeysDto});
      await expect(createRequestData.data).toDecryptAndEqualTo(pgpKeys.ada.private_decrypted, expectedSerializedSessionKeysBundleData, pgpKeys.ada.private_decrypted);
    });

    it("update the most recent session keys bundle with the new session keys and delete the other ones.", async() => {
      expect.assertions(5);
      const existingSessionKeysBundleDto1 = decryptedSessionKeysBundleDto();
      const existingSessionKeysBundleDto2 = decryptedSessionKeysBundleDto({user_id: existingSessionKeysBundleDto1.user_id, modified: "2021-10-11T08:09:00+00:00"});
      const existingSessionsKeysBundlesDto = [existingSessionKeysBundleDto1, existingSessionKeysBundleDto2];
      const existingSessionKeysBundles = new SessionKeysBundlesCollection(existingSessionsKeysBundlesDto);
      const newSessionKeysDto = [...existingSessionKeysBundleDto1.data.session_keys, ...sharedResourcesSessionKeys()];
      const newSessionKeys = new SessionKeysCollection(newSessionKeysDto);

      // Mock the retrieval of existing session keys bundles.
      jest.spyOn(saveSessionKeysService.getOrFindSessionKeysService, "getOrFindAllBundles").mockImplementationOnce(() => existingSessionKeysBundles);
      // Mock the update of session keys bundle.
      let createRequestId, createRequestData;
      jest.spyOn(saveSessionKeysService.sessionKeysBundleApiService, "update").mockImplementationOnce((id, entity) => {
        createRequestId = id;
        createRequestData = entity;
        return {...entity.toDto(), modified: "2024-11-20T22:30:00+00:00"};
      });
      // Mock the deletion of session keys bundle.
      jest.spyOn(saveSessionKeysService.sessionKeysBundleApiService, "delete").mockImplementationOnce(() => ({}));
      // Mock the session storage set.
      jest.spyOn(saveSessionKeysService.sessionKeysBundlesSessionStorageService, "set").mockImplementationOnce(jest.fn);

      await saveSessionKeysService.save(newSessionKeys, pgpKeys.ada.passphrase);

      expect(saveSessionKeysService.sessionKeysBundleApiService.update).toHaveBeenCalled();
      expect(createRequestId).toEqual(existingSessionKeysBundleDto1.id);
      const expectedSessionKeysBundleDataDto = {object_type: "PASSBOLT_SESSION_KEYS", session_keys: newSessionKeysDto};
      const expectedSerializedSessionKeysBundleData = JSON.stringify(expectedSessionKeysBundleDataDto);
      await expect(createRequestData.data).toDecryptAndEqualTo(pgpKeys.ada.private_decrypted, expectedSerializedSessionKeysBundleData, pgpKeys.ada.private_decrypted);
      expect(saveSessionKeysService.sessionKeysBundleApiService.delete).toHaveBeenCalledWith(existingSessionKeysBundleDto2.id);
      expect(saveSessionKeysService.sessionKeysBundlesSessionStorageService.set).toHaveBeenCalledWith(
        new SessionKeysBundlesCollection([{...createRequestData.toDto(), data: expectedSessionKeysBundleDataDto, modified: "2024-11-20T22:30:00+00:00"}])
      );
    });
  });
});
