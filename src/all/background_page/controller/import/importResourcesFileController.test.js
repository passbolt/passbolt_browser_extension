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
import AccountEntity from "../../model/entity/account/accountEntity";
import FolderService from "../../service/api/folder/folderService";
import ResourceService from "../../service/api/resource/resourceService";
import TagService from "../../service/api/tag/tagService";
import ImportResourcesFileController from "./importResourcesFileController";
import ResourceTypeService from "../../service/api/resourceType/resourceTypeService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {bitwardenCsvFile, chromiumCsvFile, dashlaneCsvFile, defaultCsvData, defaultKDBXCSVData, lastpassCsvFile, logMeOnceCsvFile, mozillaCsvFile, nordPassCsvFile, onePasswordCsvFile, safariCsvFile} from "../../model/entity/import/importResourcesFileEntity.test.data";
import BinaryConvert from "../../utils/format/binaryConvert";
import each from "jest-each";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import FileTypeError from "../../error/fileTypeError";
import MockExtension from "../../../../../test/mocks/mockExtension";
import fs from "fs";
import DecryptMessageService from "../../service/crypto/decryptMessageService";
import DecryptPrivateKeyService from "../../service/crypto/decryptPrivateKeyService";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import {defaultTagDto} from "../../model/entity/tag/tagEntity.test.data";
import ExternalResourceEntity from "../../model/entity/resource/external/externalResourceEntity";
import {defaultExternalResourceImportMinimalDto} from "../../model/entity/resource/external/externalResourceEntity.test.data";
import MetadataTypesSettingsEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";
import {defaultMetadataTypesSettingsV4Dto, defaultMetadataTypesSettingsV50FreshDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity.test.data";
import {defaultDecryptedSharedMetadataKeysDtos} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import PassphraseStorageService from "../../service/session_storage/passphraseStorageService";
import GetOrFindMetadataKeysService from "../../service/metadata/getOrFindMetadataKeysService";
import MetadataKeysSettingsApiService from "../../service/api/metadata/metadataKeysSettingsApiService";
import {defaultMetadataKeysSettingsDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";
import FindMetadataSettingsService from "../../service/metadata/findMetadataSettingsService";
import {RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG, RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG, RESOURCE_TYPE_V5_DEFAULT_SLUG, RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeSchemasDefinition";
import GetOrFindMetadataSettingsService from "../../service/metadata/getOrFindMetadataSettingsService";

beforeEach(async() => {
  await MockExtension.withConfiguredAccount();
});

describe("ImportResourcesFileController", () => {
  let controller, worker, collection;
  describe("::exec", () => {
    const account = new AccountEntity(defaultAccountDto({user_id: pgpKeys.ada.userId}));
    const apiClientOptions = defaultApiClientOptions();
    /**
     * Decrypt a secret
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
          emit: jest.fn(),
          request: jest.fn()
        }
      };

      controller = new ImportResourcesFileController(worker, null, apiClientOptions, account);
      collection = resourceTypesCollectionDto();
      //Mock controller
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockResolvedValue(pgpKeys.ada.passphrase);
      //Mock api
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => collection);
      jest.spyOn(ResourceService.prototype, "create").mockImplementation(() => defaultResourceDto());
      jest.spyOn(FolderService.prototype, "create").mockImplementation(() => defaultFolderDto());
      jest.spyOn(TagService.prototype, "updateResourceTags").mockImplementation(() => [defaultTagDto({slug: "import-ref"})]);
      const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
      const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
      jest.spyOn(PassphraseStorageService, "get").mockImplementation(() => pgpKeys.ada.passphrase);
      jest.spyOn(GetOrFindMetadataKeysService.prototype, "getOrFindAll").mockImplementation(() => metadataKeys);
      jest.spyOn(MetadataKeysSettingsApiService.prototype, "findSettings").mockImplementation(() => defaultMetadataKeysSettingsDto());
    });

    describe("Should assert the fileType param.", () => {
      beforeEach(() => {
        jest.spyOn(FindMetadataSettingsService.prototype, "findTypesSettings")
          .mockImplementationOnce(() => new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto()));
      });
      it("Should accept csv extension.", async() => {
        expect.assertions(1);

        const promise = controller.exec("csv", btoa(BinaryConvert.toBinary(defaultCsvData)));

        await expect(promise).resolves.not.toThrow();
      });


      it("Should accept kdbx extension.", async() => {
        expect.assertions(1);

        const promise = controller.exec("kdbx", fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-not-protected.kdbx", {encoding: 'base64'}));

        await expect(promise).resolves.not.toThrow();
      });

      each([
        {scenario: "empty file extension", extension: null},
        {scenario: "xls", extension: "xls"},
        {scenario: "xlsx", extension: "xlsx"},
        {scenario: "tsv", extension: "tsv"},
        {scenario: "pdf", extension: "pdf"},
        {scenario: "JSON", extension: "json"},
        {scenario: "XML", extension: "xml"},
        {scenario: "yaml", extension: "yaml"},
      ]).describe("Should reject other extension.", test => {
        it(`Should reject ${test.scenario} extension`, async() => {
          expect.assertions(1);

          const promise = controller.exec(test.scenario, null);

          await expect(promise).rejects.toThrow(new FileTypeError("The file type is not supported"));
        });
      });
    });

    describe("Should assert the file param.", () => {
      beforeEach(() => {
        jest.spyOn(FindMetadataSettingsService.prototype, "findTypesSettings")
          .mockImplementationOnce(() => new MetadataTypesSettingsEntity(defaultMetadataTypesSettingsV50FreshDto()));
      });
      it("Should accept only base64.", async() => {
        expect.assertions(1);

        const promise = controller.exec("csv", btoa(BinaryConvert.toBinary(defaultCsvData)));

        await expect(promise).resolves.not.toThrow();
      });

      each([
        {scenario: "null", file: null},
        {scenario: "undefined", file: undefined},
        {scenario: "string", file: "not a base 64"},
        {scenario: "number", file: 1},
        {scenario: "Object", file: {}},
        {scenario: "Array", file: []},
        {scenario: "boolean", file: true},
        {scenario: "function", file: () => { }},
      ]).describe("Should reject other file.", test => {
        it(`Should reject ${test.scenario} file`, async() => {
          expect.assertions(1);

          const promise = controller.exec("csv", test.file);

          if (typeof test.file === "string") {
            await expect(promise).rejects.toThrow(new TypeError("The given parameter is not a valid base64 string"));
          } else {
            await expect(promise).rejects.toThrow(new TypeError(`Expected a string but received a ${test.scenario}`));
          }
        });
      });
    });

    describe("Should parse kdbx file and import resources.", () => {
      each([
        {
          scenario: "default v4",
          metadataTypesSettings: defaultMetadataTypesSettingsV4Dto(),
          resourceType: RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG
        },
        {
          scenario: "default v5",
          metadataTypesSettings: defaultMetadataTypesSettingsV50FreshDto(),
          resourceType: RESOURCE_TYPE_V5_DEFAULT_SLUG
        },
      ]).describe("should parse minimal csv", test => {
        beforeEach(() => {
          jest.spyOn(GetOrFindMetadataSettingsService.prototype, "getOrFindTypesSettings")
            .mockImplementationOnce(() => new MetadataTypesSettingsEntity(test.metadataTypesSettings));
        });

        it(`should import non encrypted kdbx - <${test.scenario}>`, async() => {
          expect.assertions(10);

          const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-not-protected.kdbx", {encoding: 'base64'});

          const result = await controller.exec("kdbx", file);

          expect(result.importResources.items.length).toEqual(4);
          expect(result.importResourcesErrors.length).toEqual(0);

          const importedResources = result.importResources.items;
          const expectedResourceType = collection.find(resourceType =>  resourceType.slug === test.resourceType);

          const secret1 = await decryptSecret(importedResources[0].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);
          const secret2 = await decryptSecret(importedResources[1].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);
          const secret3 = await decryptSecret(importedResources[2].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);
          const secret4 = await decryptSecret(importedResources[3].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);

          if (test.scenario === "default v4") {
            expect(secret1).toEqual("{\"password\":\"Secret 1\",\"description\":\"Description 1\"}");
            expect(secret2).toEqual("{\"password\":\"Secret 2\",\"description\":\"Description 2\"}");
            expect(secret3).toEqual("{\"password\":\"Secret 4\",\"description\":\"Description 4\"}");
            expect(secret4).toEqual("{\"password\":\"Secret 3\",\"description\":\"Description 3\"}");
          } else if (test.scenario === "default v5") {
            expect(secret1).toEqual("{\"object_type\":\"PASSBOLT_SECRET_DATA\",\"password\":\"Secret 1\",\"description\":\"Description 1\"}");
            expect(secret2).toEqual("{\"object_type\":\"PASSBOLT_SECRET_DATA\",\"password\":\"Secret 2\",\"description\":\"Description 2\"}");
            expect(secret3).toEqual("{\"object_type\":\"PASSBOLT_SECRET_DATA\",\"password\":\"Secret 4\",\"description\":\"Description 4\"}");
            expect(secret4).toEqual("{\"object_type\":\"PASSBOLT_SECRET_DATA\",\"password\":\"Secret 3\",\"description\":\"Description 3\"}");
          }


          const externalEntity1 = new ExternalResourceEntity(defaultExternalResourceImportMinimalDto({
            id: importedResources[0].id,
            name: 'Password 1',
            username: 'username1',
            uris: ['https://url1.com'],
            resource_type_id: expectedResourceType.id,
            folder_parent_path: importedResources[0].folderParentPath,
            folder_parent_path_expected: "/Root/Folder 1/Folder 2",
            expired: null
          }));
          const externalEntity2 = new ExternalResourceEntity(defaultExternalResourceImportMinimalDto({
            id: importedResources[1].id,
            name: 'Password 2',
            username: 'username2',
            uris: ['https://url2.com'],
            resource_type_id: expectedResourceType.id,
            folder_parent_path: importedResources[1].folderParentPath,
            folder_parent_path_expected: "/Root/Folder 1",
            expired: null
          }));
          const externalEntity3 = new ExternalResourceEntity(defaultExternalResourceImportMinimalDto({
            id: importedResources[2].id,
            name: 'Password 4',
            username: 'username4',
            uris: ['https://url4.com'],
            resource_type_id: expectedResourceType.id,
            folder_parent_path: importedResources[2].folderParentPath,
            folder_parent_path_expected: "/Root/Folder 2/Folder 1",
            expired: null
          }));
          const externalEntity4 = new ExternalResourceEntity(defaultExternalResourceImportMinimalDto({
            id: importedResources[3].id,
            name: 'Password 3',
            username: 'username3',
            uris: ['https://url3.com'],
            resource_type_id: expectedResourceType.id,
            folder_parent_path: importedResources[3].folderParentPath,
            folder_parent_path_expected: "/Root/Folder 3/Folder 4",
            expired: null
          }));

          //Remove encrypted secrets checked previously
          delete importedResources[0]._secrets;
          delete importedResources[1]._secrets;
          delete importedResources[2]._secrets;
          delete importedResources[3]._secrets;

          expect(importedResources[0].toDto()).toEqual(externalEntity1.toDto());
          expect(importedResources[1].toDto()).toEqual(externalEntity2.toDto());
          expect(importedResources[2].toDto()).toEqual(externalEntity3.toDto());
          expect(importedResources[3].toDto()).toEqual(externalEntity4.toDto());
        });

        it(`should import encrypted with password kdbx - <${test.scenario}>`, async() => {
          expect.assertions(4);

          const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-protected-password.kdbx", {encoding: 'base64'});
          const options = {
            "credentials": {
              "password": "passbolt"
            }
          };

          const result = await controller.exec("kdbx", file, options);

          expect(result.importResources.items[0].secrets.items.length).toEqual(1);
          expect(result.importResourcesErrors.length).toEqual(0);

          const importedResources = result.importResources.items;
          const expectedResourceType = collection.find(resourceType =>  resourceType.slug === test.resourceType);
          const secret1 = await decryptSecret(result.importResources.items[0].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);

          // @todo Sorry for the patch, the scenario need a deeper refactoring.
          if (test.scenario === "default v4") {
            expect(secret1).toEqual("{\"password\":\"Secret 1\",\"description\":\"Description 1\"}");
          } else if (test.scenario === "default v5") {
            expect(secret1).toEqual("{\"object_type\":\"PASSBOLT_SECRET_DATA\",\"password\":\"Secret 1\",\"description\":\"Description 1\"}");
          }

          const externalEntity1 = new ExternalResourceEntity(defaultExternalResourceImportMinimalDto({
            id: importedResources[0].id,
            name: 'Password 1',
            username: 'username1',
            uris: ['https://url1.com'],
            resource_type_id: expectedResourceType.id,
            folder_parent_path: importedResources[0].folderParentPath,
            folder_parent_path_expected: "/Root",
            expired: null
          }));

          //Remove encrypted secrets checked previously
          delete importedResources[0]._secrets;

          expect(importedResources[0].toDto()).toEqual(externalEntity1.toDto());
        });

        it(`should import encrypted with keyfile kdbx - <${test.scenario}>`, async() => {
          expect.assertions(4);

          const file = fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-protected-keyfile.kdbx", {encoding: 'base64'});
          const options = {
            credentials: {
              keyfile: fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-keyfile.key", {encoding: 'base64'})
            }
          };

          const result = await controller.exec("kdbx", file, options);

          expect(result.importResources.items[0].secrets.items.length).toEqual(1);
          expect(result.importResourcesErrors.length).toEqual(0);

          const importedResources = result.importResources.items;
          const expectedResourceType = collection.find(resourceType =>  resourceType.slug === test.resourceType);
          const secret1 = await decryptSecret(result.importResources.items[0].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);

          expect(secret1).toEqual("{\"password\":\"Secret 1\",\"description\":\"Description 1\"}");

          const externalEntity1 = new ExternalResourceEntity(defaultExternalResourceImportMinimalDto({
            id: importedResources[0].id,
            name: 'Password 1',
            username: 'username1',
            uris: ['https://url1.com'],
            resource_type_id: expectedResourceType.id,
            folder_parent_path: importedResources[0].folderParentPath,
            folder_parent_path_expected: "/Root",
            expired: null
          }));

          //Remove encrypted secrets checked previously
          delete importedResources[0]._secrets;

          expect(importedResources[0].toDto()).toEqual(externalEntity1.toDto());
        });
      });
    });

    describe("Should parse csv file and import resources.", () => {
      each([
        {
          scenario: "chromium",
          file: chromiumCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV4Dto(),
          resourceType: RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG
        },
        {
          scenario: "mozilla",
          file: mozillaCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV4Dto(),
          resourceType: RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG
        },
        {
          scenario: "chromium",
          file: chromiumCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV50FreshDto(),
          resourceType: RESOURCE_TYPE_V5_DEFAULT_SLUG
        },
        {
          scenario: "mozilla",
          file: mozillaCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV50FreshDto(),
          resourceType: RESOURCE_TYPE_V5_DEFAULT_SLUG
        },
      ]).describe("should parse minimal csv", test => {
        beforeEach(() => {
          jest.spyOn(GetOrFindMetadataSettingsService.prototype, "getOrFindTypesSettings")
            .mockImplementationOnce(() => new MetadataTypesSettingsEntity(test.metadataTypesSettings));
        });
        it(`should parse ${test.scenario} csv file - <default ${test.metadataTypesSettings.default_resource_types}>`, async() => {
          expect.assertions(4);

          const result = await controller.exec("csv", btoa(BinaryConvert.toBinary(chromiumCsvFile)));

          expect(result.importResources.items[0].secrets.items.length).toEqual(1);
          expect(result.importResourcesErrors.length).toEqual(0);

          const importedResources = result.importResources.items;
          const expectedResourceType = collection.find(resourceType =>  resourceType.slug === test.resourceType);
          const secret1 = await decryptSecret(result.importResources.items[0].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);

          expect(secret1).toEqual("{\"password\":\"Password 1\",\"description\":\"\"}");

          const externalEntity1 = new ExternalResourceEntity(defaultExternalResourceImportMinimalDto({
            id: importedResources[0].id,
            name: 'Password 1',
            username: 'Username 1',
            uris: ['https://url1.com'],
            resource_type_id: expectedResourceType.id,
            folder_parent_path: importedResources[0].folderParentPath,
            folder_parent_path_expected: ""
          }));

          //Remove encrypted secrets checked previously
          delete importedResources[0]._secrets;

          expect(importedResources[0].toDto()).toEqual(externalEntity1.toDto());
        });
      });

      each([
        {
          scenario: "dashlane",
          file: dashlaneCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV4Dto(),
          resourceType: RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG
        },
        {
          scenario: "dashlane",
          file: dashlaneCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV50FreshDto(),
          resourceType: RESOURCE_TYPE_V5_DEFAULT_SLUG
        },
        {
          scenario: "safari",
          file: safariCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV4Dto(),
          resourceType: RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG
        },
        {
          scenario: "safari",
          file: safariCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV50FreshDto(),
          resourceType: RESOURCE_TYPE_V5_DEFAULT_SLUG
        },
        {
          scenario: "nordPass", file: nordPassCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV4Dto(),
          resourceType: RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG
        },
        {
          scenario: "nordPass",
          file: nordPassCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV50FreshDto(),
          resourceType: RESOURCE_TYPE_V5_DEFAULT_SLUG
        }
      ]).describe("Should parse csv with description", test => {
        beforeEach(() => {
          jest.spyOn(GetOrFindMetadataSettingsService.prototype, "getOrFindTypesSettings")
            .mockImplementationOnce(() => new MetadataTypesSettingsEntity(test.metadataTypesSettings));
        });
        it(`should parse ${test.scenario} csv file - <default ${test.metadataTypesSettings.default_resource_types}>`, async() => {
          expect.assertions(4);

          const result = await controller.exec("csv", btoa(BinaryConvert.toBinary(test.file)));

          expect(result.importResources.items[0].secrets.items.length).toEqual(1);
          expect(result.importResourcesErrors.length).toEqual(0);

          const importedResources = result.importResources.items;
          const expectedResourceType = collection.find(resourceType =>  resourceType.slug === test.resourceType);
          const secret1 = await decryptSecret(result.importResources.items[0].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);

          expect(secret1).toEqual("{\"password\":\"Password 1\",\"description\":\"Description 1\"}");

          const externalEntity1 = new ExternalResourceEntity(defaultExternalResourceImportMinimalDto({
            id: importedResources[0].id,
            name: 'Password 1',
            username: 'Username 1',
            uris: ['https://url1.com'],
            resource_type_id: expectedResourceType.id,
            folder_parent_path: importedResources[0].folderParentPath,
          }));

          //Remove encrypted secrets checked previously
          delete importedResources[0]._secrets;

          expect(importedResources[0].toDto()).toEqual(externalEntity1.toDto());
        });
      });

      each([
        {
          scenario: "1Password", file: onePasswordCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV4Dto(),
          resourceType: RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG
        },
        {
          scenario: "1Password",
          file: onePasswordCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV50FreshDto(),
          resourceType: RESOURCE_TYPE_V5_DEFAULT_SLUG
        },
        {
          scenario: "lastpass", file: lastpassCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV4Dto(),
          resourceType: RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG
        },
        {
          scenario: "lastpass",
          file: lastpassCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV50FreshDto(),
          resourceType: RESOURCE_TYPE_V5_DEFAULT_SLUG
        },
        {
          scenario: "logMeOnce",
          file: logMeOnceCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV4Dto(),
          resourceType: RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG
        },
        {
          scenario: "logMeOnce",
          file: logMeOnceCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV50FreshDto(),
          resourceType: RESOURCE_TYPE_V5_DEFAULT_SLUG
        },
      ]).describe("Should parse csv with description and folder", test => {
        beforeEach(() => {
          jest.spyOn(GetOrFindMetadataSettingsService.prototype, "getOrFindTypesSettings")
            .mockImplementationOnce(() => new MetadataTypesSettingsEntity(test.metadataTypesSettings));
        });
        it(`should parse ${test.scenario} csv file - <default ${test.metadataTypesSettings.default_resource_types}>`, async() => {
          expect.assertions(4);

          const result = await controller.exec("csv", btoa(BinaryConvert.toBinary(test.file)));

          expect(result.importResources.items[0].secrets.items.length).toEqual(1);
          expect(result.importResourcesErrors.length).toEqual(0);

          const importedResources = result.importResources.items;
          const expectedResourceType = collection.find(resourceType =>  resourceType.slug === test.resourceType);
          const secret1 = await decryptSecret(result.importResources.items[0].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);

          expect(secret1).toEqual("{\"password\":\"Password 1\",\"description\":\"Description 1\"}");

          const externalEntity1 = new ExternalResourceEntity(defaultExternalResourceImportMinimalDto({
            id: importedResources[0].id,
            name: 'Password 1',
            username: 'Username 1',
            uris: ['https://url1.com'],
            resource_type_id: expectedResourceType.id,
            folder_parent_path: importedResources[0].folderParentPath,
            folder_parent_path_expected: "/Folder 1"
          }));

          //Remove encrypted secrets checked previously
          delete importedResources[0]._secrets;

          expect(importedResources[0].toDto()).toEqual(externalEntity1.toDto());
        });
      });

      each([
        {
          scenario: "keypass",
          file: defaultKDBXCSVData(),
          metadataTypesSettings: defaultMetadataTypesSettingsV4Dto(),
          resourceType: RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG
        },
        {
          scenario: "keypass",
          file: defaultKDBXCSVData(),
          metadataTypesSettings: defaultMetadataTypesSettingsV50FreshDto(),
          resourceType: RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG
        },
        {
          scenario: "bitwarden",
          file: bitwardenCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV4Dto(),
          resourceType: RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG
        },
        {
          scenario: "bitwarden",
          file: bitwardenCsvFile,
          metadataTypesSettings: defaultMetadataTypesSettingsV50FreshDto(),
          resourceType: RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG
        },
      ]).describe("Should parse keypass with description, folder and totp", test => {
        beforeEach(() => {
          jest.spyOn(GetOrFindMetadataSettingsService.prototype, "getOrFindTypesSettings")
            .mockImplementationOnce(() => new MetadataTypesSettingsEntity(test.metadataTypesSettings));
        });
        it(`should parse ${test.scenario} csv file - <default ${test.metadataTypesSettings.default_resource_types}`, async() => {
          expect.assertions(4);

          const result = await controller.exec("csv", btoa(BinaryConvert.toBinary(test.file)));

          expect(result.importResources.items[0].secrets.items.length).toEqual(1);
          expect(result.importResourcesErrors.length).toEqual(0);

          const importedResources = result.importResources.items;
          const expectedResourceType = collection.find(resourceType =>  resourceType.slug === test.resourceType);
          const secret1 = await decryptSecret(result.importResources.items[0].secrets.items[0].data, pgpKeys.ada.private, pgpKeys.ada.passphrase);

          expect(secret1).toEqual("{\"password\":\"Password 1\",\"description\":\"Description 1\",\"totp\":{\"secret_key\":\"THISISASECRET\",\"period\":30,\"digits\":6,\"algorithm\":\"SHA1\"}}");

          const externalEntity1 = new ExternalResourceEntity(defaultExternalResourceImportMinimalDto({
            id: importedResources[0].id,
            name: 'Password 1',
            username: 'Username 1',
            uris: ['https://url1.com'],
            resource_type_id: expectedResourceType.id,
            folder_parent_path: importedResources[0].folderParentPath,
            folder_parent_path_expected: "/Folder 1"
          }));

          //Remove encrypted secrets checked previously
          delete importedResources[0]._secrets;

          expect(importedResources[0].toDto()).toEqual(externalEntity1.toDto());
        });
      });
    });

    it("should request passphrase and decrypt the private key", async() => {
      expect.assertions(1);

      jest.spyOn(controller.importResourcesService, "importFile");
      const file = btoa(BinaryConvert.toBinary(defaultCsvData));

      await controller.exec("csv", file);

      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
    });
    it(`should init progressService and provide it to the service`, async() => {
      expect.assertions(1);

      expect(controller.importResourcesService.progressService).toEqual(controller.progressService);
    });

    it("should close progressService in case of error", async() => {
      expect.assertions(1);

      jest.spyOn(controller.progressService, "close");
      jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => { throw new Error("API error"); });
      const file = btoa(BinaryConvert.toBinary(defaultCsvData));

      try {
        await controller.exec("csv", file);
      } catch {
        expect(controller.progressService.close).toHaveBeenCalledTimes(1);
      }
    });

    it("should close progressService in case of succss", async() => {
      expect.assertions(1);

      jest.spyOn(controller.progressService, "close");
      const file = btoa(BinaryConvert.toBinary(defaultCsvData));

      await controller.exec("csv", file);
      expect(controller.progressService.close).toHaveBeenCalledTimes(1);
    });

    it("[performance] should ensure performance adding large dataset remains effective", async() => {
      const linesCount = 100;
      const defaultCsvDataFile = defaultKDBXCSVData(linesCount);
      const file = btoa(BinaryConvert.toBinary(defaultCsvDataFile));

      const start = performance.now();
      const result = await controller.exec("csv", file);
      const time = performance.now() - start;
      expect(result.importResources.items).toHaveLength(linesCount);
      expect(time).toBeLessThan(5000);
    });
  });
});
