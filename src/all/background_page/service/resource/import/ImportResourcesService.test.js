/**
 * @jest-environment ./test/jest.custom-kdbx-environment
 */
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
 * @since         4.10.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import AccountEntity from "../../../model/entity/account/accountEntity";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import ImportResourcesService from "./ImportResourcesService";
import ProgressService from "../../progress/progressService";
import ImportResourcesFileEntity from "../../../model/entity/import/importResourcesFileEntity";
import ResourceTypeService from "../../api/resourceType/resourceTypeService";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {defaultImportResourceFileCSVDto, defaultKDBXCSVData, KdbxCsvFileTotpData} from "../../../model/entity/import/importResourcesFileEntity.test.data";
import MockExtension from "../../../../../../test/mocks/mockExtension";
import {OpenpgpAssertion} from "../../../utils/openpgp/openpgpAssertions";
import ResourceService from "../../api/resource/resourceService";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import DecryptPrivateKeyService from "../../crypto/decryptPrivateKeyService";
import DecryptMessageService from "../../crypto/decryptMessageService";
import BinaryConvert from "../../../utils/format/binaryConvert";
import ImportError from "../../../error/importError";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import FolderService from "../../api/folder/folderService";
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import TagService from "../../api/tag/tagService";
import {defaultTagDto} from "../../../model/entity/tag/tagEntity.test.data";
import ExternalResourceEntity from "../../../model/entity/resource/external/externalResourceEntity";
import {defaultExternalResourceImportMinimalDto} from "../../../model/entity/resource/external/externalResourceEntity.test.data";
import ExternalFolderEntity from "../../../model/entity/folder/external/externalFolderEntity";
import {minimalExternalFolderDto} from "../../../model/entity/folder/external/externalFolderEntity.test.data";
import ResourceLocalStorage from "../../local_storage/resourceLocalStorage";
import MetadataTypesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import {defaultMetadataTypesSettingsV4Dto, defaultMetadataTypesSettingsV50FreshDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import GetOrFindMetadataKeysService from "../../metadata/getOrFindMetadataKeysService";
import {defaultMetadataKeysSettingsDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";
import {defaultDecryptedSharedMetadataKeysDtos} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import MetadataKeysSettingsApiService from "../../api/metadata/metadataKeysSettingsApiService";
import PassphraseStorageService from "../../session_storage/passphraseStorageService";
import {RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG, RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG, RESOURCE_TYPE_TOTP_SLUG, RESOURCE_TYPE_V5_DEFAULT_SLUG, RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG, RESOURCE_TYPE_V5_TOTP_SLUG} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeSchemasDefinition";
import each from "jest-each";
import GetOrFindMetadataSettingsService from "../../metadata/getOrFindMetadataSettingsService";

jest.mock("../../../service/progress/progressService");

beforeEach(async() =>  {
  await MockExtension.withConfiguredAccount();
});

describe("ImportResourcesService", () => {
  let importResourcesService, worker, importResourceFileCSV, passphrase, collection;

  const account = new AccountEntity(defaultAccountDto({user_id: pgpKeys.ada.userId}));
  const apiClientOptions = defaultApiClientOptions();

  /**
   * Decrypt a secret for test
   * @param {string} secret the secret
   * @param {string} privateKey The private key
   * @param {string} passphrase The passphrase
   * @returns {Promise<string>}
   */
  const decryptSecret = async(secret, privateKey, passphrase) => {
    const decryptedPrivateKey = await DecryptPrivateKeyService.decryptArmoredKey(privateKey, passphrase);
    const secretMessage = await OpenpgpAssertion.readMessageOrFail(secret);
    const signingKey = await OpenpgpAssertion.readKeyOrFail(account.userPublicArmoredKey);
    return DecryptMessageService.decrypt(secretMessage, decryptedPrivateKey, [signingKey]);
  };


  beforeEach(async() => {
    worker = {
      port: {
        emit: jest.fn()
      }
    };
    importResourcesService = new ImportResourcesService(account, apiClientOptions, new ProgressService(worker, ""));
    collection = resourceTypesCollectionDto();
    jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => collection);
    importResourceFileCSV = new ImportResourcesFileEntity(defaultImportResourceFileCSVDto());
    passphrase = pgpKeys.ada.passphrase;
  });

  describe("::importFile", () => {
    beforeEach(async() =>  {
      jest.spyOn(ResourceService.prototype, "create").mockImplementation(() => defaultResourceDto());
      jest.spyOn(FolderService.prototype, "create").mockImplementation(() => defaultFolderDto());
      jest.spyOn(TagService.prototype, "updateResourceTags").mockImplementation(() => [defaultTagDto({slug: "import-ref"})]);
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);
      jest.spyOn(GetOrFindMetadataKeysService.prototype, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(MetadataKeysSettingsApiService.prototype, "findSettings").mockImplementation(() => defaultMetadataKeysSettingsDto());
    });
    each([
      {
        scenario: "Default content type v4",
        metadataTypesSettings: defaultMetadataTypesSettingsV4Dto(),
      },
      {
        scenario: "Default content type v5",
        metadataTypesSettings: defaultMetadataTypesSettingsV50FreshDto(),
      },
    ]).describe("Should parse the file", test => {
      beforeEach(() => {
        jest.spyOn(GetOrFindMetadataSettingsService.prototype, "getOrFindTypesSettings")
          .mockImplementationOnce(() => new MetadataTypesSettingsEntity(test.metadataTypesSettings));
      });
      it(`Should parse the file with password and description - <${test.scenario}>`, async() => {
        expect.assertions(7);

        const expectedSlug = test.metadataTypesSettings.default_resource_types === "v4" ? RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG : RESOURCE_TYPE_V5_DEFAULT_SLUG;
        const expectedResourceType = collection.find(resourceType =>  resourceType.slug === expectedSlug);

        expect(importResourceFileCSV.importResources.items.length).toEqual(0);

        const result = await importResourcesService.importFile(importResourceFileCSV, passphrase);

        expect(result.importResources.items.length).toEqual(2);
        expect(result.importResourcesErrors.length).toEqual(0);

        const importedResources = result.importResources.items;

        const secret1 =  await decryptSecret(result.importResources.items[0].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);
        const secret2 =  await decryptSecret(result.importResources.items[1].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);
        expect(secret1).toEqual("{\"password\":\"Password 1\",\"description\":\"Description 1\"}");
        expect(secret2).toEqual("{\"password\":\"Password 2\",\"description\":\"Description 2\"}");

        //Remove encrypted secrets checked previously
        delete importedResources[0]._secrets;
        delete importedResources[1]._secrets;

        const externalEntity1 = new ExternalResourceEntity(defaultExternalResourceImportMinimalDto({
          id: importedResources[0].id,
          name: 'Password 1',
          resource_type_id: expectedResourceType.id,
          folder_parent_path: "import-ref",
          uri: "https://url1.com",
          username: "Username 1",
        }));

        const externalEntity2 = new ExternalResourceEntity(defaultExternalResourceImportMinimalDto({
          id: importedResources[1].id,
          name: 'Password 2',
          resource_type_id: expectedResourceType.id,
          folder_parent_path: "import-ref",
          uri: "https://url1.com",
          username: "Username 2",
          folder_parent_path_expected: "/Folder",
        }));

        expect(importedResources[0].toDto()).toEqual(externalEntity1.toDto());
        expect(importedResources[1].toDto()).toEqual(externalEntity2.toDto());
      });

      it(`Should parse the file with password, description and totp - <${test.scenario}>`, async() => {
        expect.assertions(4);

        const expectedSlug = test.metadataTypesSettings.default_resource_types === "v4" ? RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG : RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG;
        const expectedResourceType = collection.find(resourceType =>  resourceType.slug === expectedSlug);

        importResourceFileCSV = new ImportResourcesFileEntity(defaultImportResourceFileCSVDto({
          file: btoa(BinaryConvert.toBinary(defaultKDBXCSVData))
        }));

        const result = await importResourcesService.importFile(importResourceFileCSV, passphrase);
        const importedResources = result.importResources.items;

        expect(importResourceFileCSV.importResources.items.length).toEqual(1);
        expect(result.importResourcesErrors.length).toEqual(0);

        const secret1 =  await decryptSecret(importResourceFileCSV.importResources.items[0].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);

        expect(secret1).toEqual("{\"password\":\"Secret 1\",\"description\":\"Description 1\",\"totp\":{\"secret_key\":\"THISISASECRET\",\"period\":30,\"digits\":6,\"algorithm\":\"SHA1\"}}");

        //Remove encrypted secrets checked previously
        delete importedResources[0]._secrets;

        const externalEntity = new ExternalResourceEntity(defaultExternalResourceImportMinimalDto({
          id: importedResources[0].id,
          name: 'Password 1',
          resource_type_id: expectedResourceType.id,
          folder_parent_path: "import-ref",
          uri: "https://url1.com",
          username: "Username 1",
          folder_parent_path_expected: "/Folder 1",
        }));

        expect(importedResources[0].toDto()).toEqual(externalEntity.toDto());
      });
      it(`Should parse the file with totp - <${test.scenario}>`, async() => {
        expect.assertions(4);

        const expectedSlug = test.metadataTypesSettings.default_resource_types === "v4" ? RESOURCE_TYPE_TOTP_SLUG : RESOURCE_TYPE_V5_TOTP_SLUG;
        const expectedResourceType = collection.find(resourceType =>  resourceType.slug === expectedSlug);

        importResourceFileCSV = new ImportResourcesFileEntity(defaultImportResourceFileCSVDto({
          file: btoa(BinaryConvert.toBinary(KdbxCsvFileTotpData))
        }));

        const result = await importResourcesService.importFile(importResourceFileCSV, passphrase);
        const importedResources = result.importResources.items;

        expect(importResourceFileCSV.importResources.items.length).toEqual(1);
        expect(result.importResourcesErrors.length).toEqual(0);

        const secret1 =  await decryptSecret(importResourceFileCSV.importResources.items[0].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);

        expect(secret1).toEqual("{\"totp\":{\"secret_key\":\"THISISASECRET\",\"period\":30,\"digits\":6,\"algorithm\":\"SHA1\"}}");

        //Remove encrypted secrets checked previously
        delete importedResources[0]._secrets;

        const externalEntity = new ExternalResourceEntity(defaultExternalResourceImportMinimalDto({
          id: importedResources[0].id,
          name: 'Password 1',
          resource_type_id: expectedResourceType.id,
          folder_parent_path: "import-ref",
          uri: "https://url1.com",
          username: "Username 1",
          folder_parent_path_expected: "",
        }));

        expect(importedResources[0].toDto()).toEqual(externalEntity.toDto());
      });
      it(`Should parse the file with totp and description - <${test.scenario}>`, async() => {
        expect.assertions(4);

        const expectedSlug = test.metadataTypesSettings.default_resource_types === "v4" ? RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG : RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG;
        const expectedResourceType = collection.find(resourceType =>  resourceType.slug === expectedSlug);

        importResourceFileCSV = new ImportResourcesFileEntity(defaultImportResourceFileCSVDto({
          file: btoa(BinaryConvert.toBinary(defaultKDBXCSVData))
        }));

        const result = await importResourcesService.importFile(importResourceFileCSV, passphrase);
        const importedResources = result.importResources.items;

        expect(importResourceFileCSV.importResources.items.length).toEqual(1);
        expect(result.importResourcesErrors.length).toEqual(0);

        const secret1 =  await decryptSecret(importResourceFileCSV.importResources.items[0].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);

        expect(secret1).toEqual("{\"password\":\"Secret 1\",\"description\":\"Description 1\",\"totp\":{\"secret_key\":\"THISISASECRET\",\"period\":30,\"digits\":6,\"algorithm\":\"SHA1\"}}");

        //Remove encrypted secrets checked previously
        delete importedResources[0]._secrets;

        const externalEntity = new ExternalResourceEntity(defaultExternalResourceImportMinimalDto({
          id: importedResources[0].id,
          name: 'Password 1',
          resource_type_id: expectedResourceType.id,
          folder_parent_path: "import-ref/Folder 1",
          uri: "https://url1.com",
          username: "Username 1",
          folder_parent_path_expected: "",
        }));

        expect(importedResources[0].toDto()).toEqual(externalEntity.toDto());
      });
      it("Should throw an error if the resource type cannot be found", async() => {
        expect.assertions(4);

        jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => []);

        importResourceFileCSV = new ImportResourcesFileEntity(defaultImportResourceFileCSVDto({
          file: btoa(BinaryConvert.toBinary(defaultKDBXCSVData))
        }));

        const result = await importResourcesService.importFile(importResourceFileCSV, passphrase);
        const error = result.importResourcesErrors[0];

        expect(importResourceFileCSV.importResources.items.length).toEqual(0);
        expect(result.importResourcesErrors.length).toEqual(1);
        expect(error.sourceError).toBeInstanceOf(Error);
        expect(error.sourceError.message).toEqual("No resource type associated to this row.");
      });
    });

    it("Should inform the user about the progress", async() => {
      expect.assertions(8);

      jest.spyOn(importResourcesService.progressService, "updateGoals");
      jest.spyOn(importResourcesService.progressService, "finishStep");


      await importResourcesService.importFile(importResourceFileCSV, passphrase);

      expect(importResourcesService.progressService.updateGoals).toHaveBeenCalledTimes(1);
      expect(importResourcesService.progressService.updateGoals).toHaveBeenCalledWith(5);
      expect(importResourcesService.progressService.finishStep).toHaveBeenCalledTimes(5);
      expect(importResourcesService.progressService.finishStep).toHaveBeenCalledWith("Encrypting 1/2");
      expect(importResourcesService.progressService.finishStep).toHaveBeenCalledWith("Encrypting 2/2");
      expect(importResourcesService.progressService.finishStep).toHaveBeenCalledWith("Importing passwords 1/2");
      expect(importResourcesService.progressService.finishStep).toHaveBeenCalledWith("Importing passwords 2/2");
      expect(importResourcesService.progressService.finishStep).toHaveBeenCalledWith(null, true);
    });

    it("Should parse the file - <folder>", async() => {
      expect.assertions(6);

      importResourceFileCSV = new ImportResourcesFileEntity(defaultImportResourceFileCSVDto({
        options: {
          folders: true
        }
      }));

      const result = await importResourcesService.importFile(importResourceFileCSV, passphrase);

      const externalFolderEntity1 = new ExternalFolderEntity(minimalExternalFolderDto({
        id: result.importFolders.items[0].id,
        name: "Folder",
        folder_parent_id: result.importFolders.items[0].folderParentId,
        folder_parent_path: "import-ref"
      }));

      const externalFolderEntity2 = new ExternalFolderEntity(minimalExternalFolderDto({
        id: result.importFolders.items[1].id,
        name: "import-ref",
        folder_parent_path: ""
      }));

      expect(result.importResources.items.length).toEqual(2);
      expect(result.importResourcesErrors.length).toEqual(0);
      expect(result.importFolders.items.length).toEqual(2);
      expect(result.importFoldersErrors.length).toEqual(0);
      expect(result.importFolders.items[0].toDto()).toEqual(externalFolderEntity1.toDto());
      expect(result.importFolders.items[1].toDto()).toEqual(externalFolderEntity2.toDto());
    });

    it("Should inform the user about the progress - <folder>", async() => {
      expect.assertions(8);

      jest.spyOn(importResourcesService.progressService, "updateGoals");

      importResourceFileCSV = new ImportResourcesFileEntity(defaultImportResourceFileCSVDto({
        options: {
          folders: true
        }
      }));

      await importResourcesService.importFile(importResourceFileCSV, passphrase);

      expect(importResourcesService.progressService.finishStep).toHaveBeenCalledTimes(7);
      expect(importResourcesService.progressService.finishStep).toHaveBeenCalledWith("Encrypting 1/2");
      expect(importResourcesService.progressService.finishStep).toHaveBeenCalledWith("Encrypting 2/2");
      expect(importResourcesService.progressService.finishStep).toHaveBeenCalledWith("Importing passwords 1/2");
      expect(importResourcesService.progressService.finishStep).toHaveBeenCalledWith("Importing passwords 2/2");
      expect(importResourcesService.progressService.finishStep).toHaveBeenCalledWith("Importing folders 1/2");
      expect(importResourcesService.progressService.finishStep).toHaveBeenCalledWith("Importing folders 2/2");
      expect(importResourcesService.progressService.finishStep).toHaveBeenCalledWith(null, true);
    });

    it("Should parse the file - <tag>", async() => {
      expect.assertions(4);

      importResourceFileCSV = new ImportResourcesFileEntity(defaultImportResourceFileCSVDto({
        options: {
          tags: true
        }
      }));

      const result = await importResourcesService.importFile(importResourceFileCSV, passphrase);

      //Reference tag is never return, so we retrieve it from storage
      const resourceCollectionStored1 = await ResourceLocalStorage.getResourceById(result.importResources.items[0].id);
      const resourceCollectionStored2 = await ResourceLocalStorage.getResourceById(result.importResources.items[1].id);

      expect(result.importResources.items.length).toEqual(2);
      expect(result.importResourcesErrors.length).toEqual(0);
      expect(resourceCollectionStored1.tags[0].slug).toEqual("import-ref");
      expect(resourceCollectionStored2.tags[0].slug).toEqual("import-ref");
    });

    it("Should init the error found during import without blocking import", async() => {
      expect.assertions(8);

      importResourceFileCSV = new ImportResourcesFileEntity(defaultImportResourceFileCSVDto({
        file: btoa(BinaryConvert.toBinary([
          "Title,Username,URL,Password,Notes,Group",
          `${"a".repeat(100000)},,,test,,\n`,
          "Password 1,Username 1,https://url1.com,Password 1,Description 1"
        ].join("\n")))
      }));

      const result = await importResourcesService.importFile(importResourceFileCSV, passphrase);

      expect(result.importResources.items.length).toEqual(1);
      expect(result.importResourcesErrors.length).toEqual(1);

      const secret1 =  await decryptSecret(importResourceFileCSV.importResources.items[0].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);
      const error = importResourceFileCSV.importResourcesErrors[0];

      expect(error).toBeInstanceOf(ImportError);
      expect(error.sourceError).toBeInstanceOf(EntityValidationError);
      expect(error.sourceError.details).toHaveProperty("name");
      expect(secret1).toEqual("{\"password\":\"Password 1\",\"description\":\"Description 1\"}");

      expect(result.importResources.items[0].name).toEqual("Password 1");
      expect(result.importResources.items[0].secretClear).toEqual("");
    });

    it("Should init the error found during import without blocking import - <folder>", async() => {
      expect.assertions(8);

      importResourceFileCSV = new ImportResourcesFileEntity(defaultImportResourceFileCSVDto({
        file: btoa(BinaryConvert.toBinary([
          "Title,Username,URL,Password,Notes,Group",
          `Folder error,,,test,,${"a".repeat(100000)}\n`,
          "Password 1,Username 1,https://url1.com,Password 1,Description 1"
        ].join("\n"))),
        options: {
          folders: true
        }
      }));

      const result = await importResourcesService.importFile(importResourceFileCSV, passphrase);

      expect(result.importResources.items.length).toEqual(2);
      expect(result.importResourcesErrors.length).toEqual(0);
      expect(result.importFolders.length).toEqual(1);
      expect(result.importFoldersErrors.length).toEqual(1);

      const error = importResourceFileCSV.importFoldersErrors[0];

      expect(error).toBeInstanceOf(ImportError);
      expect(error.sourceError).toBeInstanceOf(EntityValidationError);
      expect(error.sourceError.details).toHaveProperty("name");
      expect(result.importFolders.items[0].name).toEqual("import-ref");
    });
  });
});
