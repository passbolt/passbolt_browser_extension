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

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import GetOrFindSessionKeysService from "./getOrFindSessionKeysService";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import PassphraseStorageService from "../session_storage/passphraseStorageService";
import SessionKeysBundlesCollection from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection";
import {
  defaultSessionKeysBundlesDtos
} from "passbolt-styleguide/src/shared/models/entity/sessionKey/sessionKeysBundlesCollection.test.data";
import expect from "expect";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GetOrFindSessionKeysService", () => {
  let getOrFindSessionKeysService, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    getOrFindSessionKeysService = new GetOrFindSessionKeysService(account, apiClientOptions);
    // flush account related storage before each.
    getOrFindSessionKeysService.sessionKeysBundlesSessionStorageService.flush();
  });

  describe("::getOrFindAllBundles", () => {
    it("with empty storage, retrieves the session keys bundles from the API and store them into the session storage.", async() => {
      expect.assertions(4);

      const apiSessionKeysBundlesCollectionDto = defaultSessionKeysBundlesDtos();

      jest.spyOn(getOrFindSessionKeysService.findAndUpdateSessionKeysService.findSessionKeysService.sesionKeysBundlesApiService, "findAll")
        .mockImplementation(() => apiSessionKeysBundlesCollectionDto);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);

      // Control initial storage value.
      const initialStorageValue = await getOrFindSessionKeysService.sessionKeysBundlesSessionStorageService.get();
      await expect(initialStorageValue).toBeUndefined();

      const collection = await getOrFindSessionKeysService.getOrFindAllBundles();

      const expectedSessionKeysBundlesDto = [...apiSessionKeysBundlesCollectionDto];
      expectedSessionKeysBundlesDto.forEach(sessionKeysBundleDto => sessionKeysBundleDto.data = JSON.parse(pgpKeys.metadataKey.decryptedSessionKeysDataMessage));

      expect(PassphraseStorageService.get).toHaveBeenCalledTimes(1);
      expect(collection.toDto()).toEqual(expectedSessionKeysBundlesDto);
      const storageValue = await getOrFindSessionKeysService.sessionKeysBundlesSessionStorageService.get();
      await expect(storageValue).toEqual(expectedSessionKeysBundlesDto);
    });

    it("does not retrieve the passphrase from the session storage if passed as parameter", async() => {
      expect.assertions(1);

      const apiSessionKeysBundlesCollectionDto = defaultSessionKeysBundlesDtos();

      jest.spyOn(getOrFindSessionKeysService.findAndUpdateSessionKeysService.findSessionKeysService.sesionKeysBundlesApiService, "findAll")
        .mockImplementation(() => apiSessionKeysBundlesCollectionDto);
      jest.spyOn(PassphraseStorageService, "get");

      await getOrFindSessionKeysService.getOrFindAllBundles(pgpKeys.ada.passphrase);

      expect(PassphraseStorageService.get).not.toHaveBeenCalled();
    });

    it("with populated storage, retrieves the session keys bundles from the session storage.", async() => {
      expect.assertions(2);

      const sessionKeysBundlesCollectionDto = defaultSessionKeysBundlesDtos({}, {withDecryptedSessionKeysBundle: true});

      await getOrFindSessionKeysService.sessionKeysBundlesSessionStorageService.set(new SessionKeysBundlesCollection(sessionKeysBundlesCollectionDto));
      jest.spyOn(getOrFindSessionKeysService.findAndUpdateSessionKeysService.findSessionKeysService.sesionKeysBundlesApiService, "findAll");

      const collection = await getOrFindSessionKeysService.getOrFindAllBundles();

      expect(getOrFindSessionKeysService.findAndUpdateSessionKeysService.findSessionKeysService.sesionKeysBundlesApiService.findAll)
        .not.toHaveBeenCalled();
      expect(collection.toDto()).toEqual(sessionKeysBundlesCollectionDto);
    });
  });

  describe("::getOrFindAll", () => {
    it("returns an empty session keys collection if no bundles is found.", async() => {
      expect.assertions(2);

      const apiSessionKeysBundlesCollectionDto = [];

      jest.spyOn(getOrFindSessionKeysService.findAndUpdateSessionKeysService.findSessionKeysService.sesionKeysBundlesApiService, "findAll")
        .mockImplementation(() => apiSessionKeysBundlesCollectionDto);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);

      const collection = await getOrFindSessionKeysService.getOrFindAll();

      expect(collection).toHaveLength(0);
      expect(PassphraseStorageService.get).toHaveBeenCalledTimes(1);
    });

    it("does not retrieve the passphrase from the session storage if passed as parameter", async() => {
      expect.assertions(1);

      const apiSessionKeysBundlesCollectionDto = [];

      jest.spyOn(getOrFindSessionKeysService.findAndUpdateSessionKeysService.findSessionKeysService.sesionKeysBundlesApiService, "findAll")
        .mockImplementation(() => apiSessionKeysBundlesCollectionDto);
      jest.spyOn(PassphraseStorageService, "get");

      await getOrFindSessionKeysService.getOrFindAll(pgpKeys.ada.passphrase);

      expect(PassphraseStorageService.get).not.toHaveBeenCalled();
    });

    it("with empty storage, retrieves the session keys bundles from the API and concatenate all session keys.", async() => {
      expect.assertions(1);

      const apiSessionKeysBundlesCollectionDto = defaultSessionKeysBundlesDtos();

      jest.spyOn(getOrFindSessionKeysService.findAndUpdateSessionKeysService.findSessionKeysService.sesionKeysBundlesApiService, "findAll")
        .mockImplementation(() => apiSessionKeysBundlesCollectionDto);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);

      const collection = await getOrFindSessionKeysService.getOrFindAll();

      const expectedSessionKeysBundlesDto = [...apiSessionKeysBundlesCollectionDto];
      expectedSessionKeysBundlesDto.forEach(sessionKeysBundleDto => sessionKeysBundleDto.data = JSON.parse(pgpKeys.metadataKey.decryptedSessionKeysDataMessage));
      const expectedSessionKeysDto = expectedSessionKeysBundlesDto[0].data.session_keys;

      expect(collection.toDto()).toEqual(expectedSessionKeysDto);
    });

    it("with populated storage, retrieves the session keys bundles from the session storage and concatenate all session keys.", async() => {
      expect.assertions(2);

      const sessionKeysBundlesCollectionDto = defaultSessionKeysBundlesDtos({}, {withDecryptedSessionKeysBundle: true});
      sessionKeysBundlesCollectionDto[1].modified = "2024-10-11T08:09:00+00:00";
      const sessionKeysBundlesCollection = new SessionKeysBundlesCollection(sessionKeysBundlesCollectionDto);

      await getOrFindSessionKeysService.sessionKeysBundlesSessionStorageService.set(sessionKeysBundlesCollection);

      const collection = await getOrFindSessionKeysService.getOrFindAll();

      sessionKeysBundlesCollection.sortByModified();
      const recentSessionKeysCollection = sessionKeysBundlesCollection.items[0].data.sessionKeys;
      // Concatenate all session keys from the most recent one and validate integrity and ignore invalid
      for (let i = 1; i < sessionKeysBundlesCollection.length; i++) {
        recentSessionKeysCollection.pushMany(sessionKeysBundlesCollection.items[i].data.sessionKeys.items, {validate: false, ignoreInvalidEntity: true});
      }
      const expectedSessionKeysDto = recentSessionKeysCollection.toDto();

      expect(sessionKeysBundlesCollectionDto[1].data.session_keys[0]).toEqual(expectedSessionKeysDto[0]);
      expect(collection.toDto()).toEqual(expectedSessionKeysDto);
    });
  });

  describe("::getOrFindAllByForeignModelAndForeignIds", () => {
    it("with empty storage, retrieves the session keys bundles from the API and get all session keys by foreign model and foreign ids.", async() => {
      expect.assertions(2);

      const apiSessionKeysBundlesCollectionDto = defaultSessionKeysBundlesDtos();

      jest.spyOn(getOrFindSessionKeysService.findAndUpdateSessionKeysService.findSessionKeysService.sesionKeysBundlesApiService, "findAll")
        .mockImplementation(() => apiSessionKeysBundlesCollectionDto);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);

      const collection = await getOrFindSessionKeysService.getOrFindAllByForeignModelAndForeignIds("Resource", ["8e3874ae-4b40-590b-968a-418f704b9d9a"]);

      const expectedSessionKeysBundlesDto = [...apiSessionKeysBundlesCollectionDto];
      expectedSessionKeysBundlesDto.forEach(sessionKeysBundleDto => sessionKeysBundleDto.data = JSON.parse(pgpKeys.metadataKey.decryptedSessionKeysDataMessage));
      const expectedSessionKeysDto = expectedSessionKeysBundlesDto[0].data.session_keys;

      expect(collection.toDto()).toEqual(expectedSessionKeysDto);
      expect(PassphraseStorageService.get).toHaveBeenCalledTimes(1);
    });

    it("does not retrieve the passphrase from the session storage if passed as parameter", async() => {
      expect.assertions(1);

      const apiSessionKeysBundlesCollectionDto = defaultSessionKeysBundlesDtos();

      jest.spyOn(getOrFindSessionKeysService.findAndUpdateSessionKeysService.findSessionKeysService.sesionKeysBundlesApiService, "findAll")
        .mockImplementation(() => apiSessionKeysBundlesCollectionDto);
      jest.spyOn(PassphraseStorageService, "get");

      await getOrFindSessionKeysService.getOrFindAllByForeignModelAndForeignIds("Resource", ["8e3874ae-4b40-590b-968a-418f704b9d9a"], pgpKeys.ada.passphrase);

      expect(PassphraseStorageService.get).not.toHaveBeenCalled();
    });

    it("with populated storage, retrieves the session keys bundles from the session storage and get all session keys by foreign model and foreign ids.", async() => {
      expect.assertions(1);

      const sessionKeysBundlesCollectionDto = defaultSessionKeysBundlesDtos({}, {withDecryptedSessionKeysBundle: true});
      const foreignId1 = sessionKeysBundlesCollectionDto[1].data.session_keys[0].foreign_id;
      const foreignId3 = sessionKeysBundlesCollectionDto[3].data.session_keys[0].foreign_id;
      const sessionKeysBundlesCollection = new SessionKeysBundlesCollection(sessionKeysBundlesCollectionDto);

      await getOrFindSessionKeysService.sessionKeysBundlesSessionStorageService.set(sessionKeysBundlesCollection);

      const collection = await getOrFindSessionKeysService.getOrFindAllByForeignModelAndForeignIds("Resource", [foreignId1, foreignId3]);

      sessionKeysBundlesCollection.sortByModified();
      const recentSessionKeysCollection = sessionKeysBundlesCollection.items[0].data.sessionKeys;
      // Concatenate all session keys from the most recent one and validate integrity and ignore invalid
      for (let i = 1; i < sessionKeysBundlesCollection.length; i++) {
        recentSessionKeysCollection.pushMany(sessionKeysBundlesCollection.items[i].data.sessionKeys.items, {validate: false, ignoreInvalidEntity: true});
      }
      const expectedSessionKeysDto = [sessionKeysBundlesCollectionDto[3].data.session_keys[0], sessionKeysBundlesCollectionDto[1].data.session_keys[0]];

      expect(collection.toDto()).toEqual(expectedSessionKeysDto);
    });

    it("should throw an error if foreign model is not a string.", async() => {
      expect.assertions(1);

      const apiSessionKeysBundlesCollectionDto = defaultSessionKeysBundlesDtos();

      jest.spyOn(getOrFindSessionKeysService.findAndUpdateSessionKeysService.findSessionKeysService.sesionKeysBundlesApiService, "findAll")
        .mockImplementation(() => apiSessionKeysBundlesCollectionDto);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);

      await expect(() => getOrFindSessionKeysService.getOrFindAllByForeignModelAndForeignIds({}, [])).rejects.toThrow(new TypeError('The parameter "foreignModel" should not be an empty string'));
    });

    it("should throw an error if foreign ids is not an array of uuids.", async() => {
      expect.assertions(1);

      const apiSessionKeysBundlesCollectionDto = defaultSessionKeysBundlesDtos();

      jest.spyOn(getOrFindSessionKeysService.findAndUpdateSessionKeysService.findSessionKeysService.sesionKeysBundlesApiService, "findAll")
        .mockImplementation(() => apiSessionKeysBundlesCollectionDto);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);

      await expect(() => getOrFindSessionKeysService.getOrFindAllByForeignModelAndForeignIds("Resource", ["not a uuid"])).rejects.toThrow(new TypeError('The parameter "foreignIds" should contain only uuid', {cause: new TypeError("The given parameter is not a valid UUID")}));
    });
  });
});
