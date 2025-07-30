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
 * @since         4.10.1
 */

import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import MockExtension from "../../../../../../test/mocks/mockExtension";
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import ExportResourcesService from "./exportResourcesService";
import ProgressService from "../../progress/progressService";
import ResourceTypeService from "../../api/resourceType/resourceTypeService";
import {v4 as uuidv4} from "uuid";
import {defaultFolderDto} from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import ExportResourcesFileEntity, {FORMAT_CSV_1PASSWORD, FORMAT_CSV_BITWARDEN, FORMAT_CSV_CHROMIUM, FORMAT_CSV_DASHLANE, FORMAT_CSV_KDBX, FORMAT_CSV_LASTPASS, FORMAT_CSV_LOGMEONCE, FORMAT_CSV_MOZILLA, FORMAT_CSV_NORDPASS, FORMAT_CSV_SAFARI, FORMAT_KDBX, FORMAT_KDBX_OTHERS} from "../../../model/entity/export/exportResourcesFileEntity";
import ResourceService from "../../api/resource/resourceService";
import {RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG, RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG, RESOURCE_TYPE_V5_DEFAULT_SLUG, RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeSchemasDefinition";
import each from "jest-each";
import {resourceCollectionV4ToExport, resourceCollectionV5ToExport} from "./exportResourcesService.test.data";
import {KdbxCsvFile, bitwardenCsvFile, chromiumCsvFile, dashlaneCsvFile, lastpassCsvFile, logMeOnceCsvFile, mozillaCsvFile, nordPassCsvFile, onePasswordCsvFile, safariCsvFile} from "../../../model/entity/import/importResourcesFileEntity.test.data";
import FolderLocalStorage from "../../local_storage/folderLocalStorage";
import {defaultTotpDto} from "../../../model/entity/totp/totpDto.test.data";
import ExternalTotpEntity from "../../../model/entity/totp/externalTotpEntity";
import ExternalResourcesCollection from "../../../model/entity/resource/external/externalResourcesCollection";
import ResourcesCollection from "../../../model/entity/resource/resourcesCollection";
import ExternalFoldersCollection from "../../../model/entity/folder/external/externalFoldersCollection";
import ResourcesKdbxExporter from "../../../model/export/resources/resourcesKdbxExporter";
import fs from "fs";
import FoldersCollection from "../../../model/entity/folder/foldersCollection";
import GetOrFindMetadataKeysService from "../../metadata/getOrFindMetadataKeysService";
import {defaultDecryptedSharedMetadataKeysDtos} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import EncryptMetadataService from "../../metadata/encryptMetadataService";
import {defaultMetadataKeysSettingsDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysSettingsEntity.test.data";
import CustomFieldsCollection from "passbolt-styleguide/src/shared/models/entity/customField/customFieldsCollection";
import {defaultCustomFieldsCollection} from "passbolt-styleguide/src/shared/models/entity/customField/customFieldsCollection.test.data";

jest.mock("../../../service/progress/progressService");

beforeEach(async() => {
  await MockExtension.withConfiguredAccount();
  jest.clearAllMocks();
});

describe("ExportResourcesService", () => {
  let service, worker, foldersDto, resourceTypeCollection, encryptMetadataService;

  const account = new AccountEntity(defaultAccountDto({user_id: pgpKeys.ada.userId}));
  const apiClientOptions = defaultApiClientOptions();
  beforeEach(async() => {
    worker = {
      port: {
        emit: jest.fn()
      }
    };
    foldersDto = [defaultFolderDto({
      name: "Folder 1"
    })];

    resourceTypeCollection = resourceTypesCollectionDto();
    const metadataKeysDtos = defaultDecryptedSharedMetadataKeysDtos({armored_key: pgpKeys.metadataKey.public});
    const metadataKeys = new MetadataKeysCollection(metadataKeysDtos);
    service = new ExportResourcesService(account, apiClientOptions, new ProgressService(worker, ""));
    encryptMetadataService = new EncryptMetadataService(apiClientOptions, account);
    jest.spyOn(FolderLocalStorage, "get").mockImplementation(() => foldersDto);
    jest.spyOn(ResourceTypeService.prototype, "findAll").mockImplementation(() => resourceTypeCollection);
    jest.spyOn(GetOrFindMetadataKeysService.prototype, "getOrFindAll").mockImplementation(() => metadataKeys);
    encryptMetadataService.getOrFindMetadataSettingsService.metadataKeysSettingsLocalStorage.flush();
    jest.spyOn(encryptMetadataService.getOrFindMetadataSettingsService.findAndUpdateMetadataSettingsLocalStorageService.findMetadataSettingsService.metadataKeysSettingsApiService, "findSettings")
      .mockImplementationOnce(() => defaultMetadataKeysSettingsDto());
  });

  describe("::exportToFile", () => {
    describe("Should export the csv file.", () => {
      each([
        {format: FORMAT_CSV_LASTPASS, expected: lastpassCsvFile},
        {format: FORMAT_CSV_1PASSWORD, expected: onePasswordCsvFile},
        {format: FORMAT_CSV_CHROMIUM, expected: chromiumCsvFile},
        {format: FORMAT_CSV_MOZILLA, expected: mozillaCsvFile},
        {format: FORMAT_CSV_SAFARI, expected: safariCsvFile},
        {format: FORMAT_CSV_DASHLANE, expected: dashlaneCsvFile},
        {format: FORMAT_CSV_NORDPASS, expected: nordPassCsvFile},
        {format: FORMAT_CSV_LOGMEONCE, expected: logMeOnceCsvFile},
      ]).describe("Should export the csv file with password and description.", test => {
        each([
          {version: "v4", resourceType: RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG},
          {version: "v5", resourceType: RESOURCE_TYPE_V5_DEFAULT_SLUG, isShared: true},
          {version: "v5", resourceType: RESOURCE_TYPE_V5_DEFAULT_SLUG, isPrivate: true},
        ]).describe(`Should export ${test.format}`, iteration => {
          it(`${iteration.version}`, async() => {
            expect.assertions(1);
            const resourceType = resourceTypeCollection.find(resourceType => resourceType.slug === iteration.resourceType);
            const file = {
              format: test.format,
              resources_ids: [uuidv4()],
              folders_ids: [foldersDto[0].id],
            };
            const exportResourcesFileEntity = new ExportResourcesFileEntity(file);

            let resourceCollectionDto;
            if (iteration.version === "v4") {
              resourceCollectionDto = await resourceCollectionV4ToExport({
                resourceType: resourceType,
                folder_parent_id: foldersDto[0].id,
              });
            } else {
              resourceCollectionDto = await resourceCollectionV5ToExport({
                resourceType: resourceType,
                folder_parent_id: foldersDto[0].id,
              });
              const resourceCollection = new ResourcesCollection(resourceCollectionDto);
              await encryptMetadataService.encryptAllFromForeignModels(resourceCollection, pgpKeys.ada.passphrase);
              resourceCollectionDto = resourceCollection.resources;
            }

            jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourceCollectionDto);

            await service.prepareExportContent(exportResourcesFileEntity);
            await service.exportToFile(exportResourcesFileEntity, pgpKeys.ada.passphrase);

            expect(exportResourcesFileEntity.file).toEqual(test.expected);
          });
        });
      });
      each([
        {format: FORMAT_CSV_BITWARDEN, expected: bitwardenCsvFile},
        {format: FORMAT_CSV_KDBX, expected: KdbxCsvFile},
      ]).describe("Should export the csv file with password, description and totp.", test => {
        each([
          {version: "v4", resourceType: RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG},
          {version: "v5", resourceType: RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG},
        ]).describe(`Should export ${test.format}`, iteration => {
          it(`${iteration.version}`, async() => {
            expect.assertions(1);
            const resourceType = resourceTypeCollection.find(resourceType => resourceType.slug === iteration.resourceType);
            const file = {
              format: test.format,
              resources_ids: [uuidv4()],
              folders_ids: [foldersDto[0].id],
            };
            const exportResourcesFileEntity = new ExportResourcesFileEntity(file);

            let resourceCollectionDto;
            if (iteration.version === "v4") {
              resourceCollectionDto = await resourceCollectionV4ToExport({
                resourceType: resourceType,
                folder_parent_id: foldersDto[0].id,
                totp: defaultTotpDto({secret_key: "THISISASECRET"})
              });
            } else {
              resourceCollectionDto = await resourceCollectionV5ToExport({
                resourceType: resourceType,
                folder_parent_id: foldersDto[0].id,
                totp: defaultTotpDto({secret_key: "THISISASECRET"})
              });

              const resourceCollection = new ResourcesCollection(resourceCollectionDto);
              await encryptMetadataService.encryptAllFromForeignModels(resourceCollection, pgpKeys.ada.passphrase);
              resourceCollectionDto = resourceCollection.resources;
            }

            jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourceCollectionDto);

            await service.prepareExportContent(exportResourcesFileEntity);
            await service.exportToFile(exportResourcesFileEntity, pgpKeys.ada.passphrase);

            expect(exportResourcesFileEntity.file).toEqual(test.expected);
          });
        });
      });
    });
    describe("Should export the KDBX file.", () => {
      each([
        {format: FORMAT_KDBX},
        {format: FORMAT_KDBX_OTHERS},
      ]).describe("Should export the KDBX file.", test => {
        /**
         * Use to create the collection resources parsed into KDBX
         * @param {ExportResourcesFileEntity} resourceCollection
         * @param {ResourcesCollection} resourceCollection
         * @returns
         */
        async function getKDBXContent(exportResourcesFileEntity, resourceCollection) {
          const kdbxExporter = new ResourcesKdbxExporter(exportResourcesFileEntity);
          const exportFoldersCollection = new ExternalFoldersCollection(new FoldersCollection(foldersDto));
          const resourcecollection = new ResourcesCollection(resourceCollection);
          const exportResourcesCollection = ExternalResourcesCollection.constructFromResourcesCollection(resourcecollection, exportFoldersCollection);
          exportResourcesFileEntity.exportResources = exportResourcesCollection;
          exportResourcesFileEntity.exportFolders = exportFoldersCollection;
          exportResourcesFileEntity.exportResources.items[0].secretClear = "Password 1";
          exportResourcesFileEntity.exportResources.items[0].description = "Description 1";
          exportResourcesFileEntity.exportResources.items[0].totp = new ExternalTotpEntity(defaultTotpDto({secret_key: "THISISASECRET"}));
          await kdbxExporter.export(exportResourcesFileEntity);
        }

        each([
          {version: "v4", resourceType: RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG},
          {version: "v5", resourceType: RESOURCE_TYPE_V5_DEFAULT_SLUG},
        ]).describe(`Should export ${test.format}`, iteration => {
          it(`Should export KDBX ${test.format} without credentials - <${iteration.version}>`, async() => {
            expect.assertions(1);
            const resourceType = resourceTypeCollection.find(resourceType => resourceType.slug === iteration.resourceType);
            const file = {
              format: test.format,
              resources_ids: [uuidv4()],
              folders_ids: [foldersDto[0].id],
            };
            const resourceCollectionV4 = await resourceCollectionV4ToExport({
              resourceType: resourceType,
              folder_parent_id: foldersDto[0].id,
              totp: defaultTotpDto({secret_key: "THISISASECRET"})
            });

            const exportResourcesFileEntity = new ExportResourcesFileEntity(file);
            jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourceCollectionV4);
            await service.prepareExportContent(exportResourcesFileEntity);
            await service.exportToFile(exportResourcesFileEntity, pgpKeys.ada.passphrase);

            const expectedResourcesFileEntity = new ExportResourcesFileEntity(file);
            await getKDBXContent(expectedResourcesFileEntity, new ResourcesCollection(resourceCollectionV4));

            expect(exportResourcesFileEntity.file).toEqual(expectedResourcesFileEntity.file);
          });

          it(`Should export KDBX ${test.format} v4 with credentials - <${iteration.version}>`, async() => {
            expect.assertions(1);
            const resourceType = resourceTypeCollection.find(resourceType => resourceType.slug === iteration.resourceType);
            const file = {
              format: test.format,
              resources_ids: [uuidv4()],
              folders_ids: [foldersDto[0].id],
              option: {credentials: {password: "secret"}}
            };
            const resourceCollectionV4 = await resourceCollectionV4ToExport({
              resourceType: resourceType,
              folder_parent_id: foldersDto[0].id,
              totp: defaultTotpDto({secret_key: "THISISASECRET"})
            });

            const exportResourcesFileEntity = new ExportResourcesFileEntity(file);
            jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourceCollectionV4);
            await service.prepareExportContent(exportResourcesFileEntity);
            await service.exportToFile(exportResourcesFileEntity, pgpKeys.ada.passphrase);

            const expectedResourcesFileEntity = new ExportResourcesFileEntity(file);
            await getKDBXContent(expectedResourcesFileEntity, new ResourcesCollection(resourceCollectionV4));

            expect(exportResourcesFileEntity.file).toEqual(expectedResourcesFileEntity.file);
          });

          it(`Should export KDBX ${test.format} v4 with keyFile - <${iteration.version}>`, async() => {
            expect.assertions(1);
            const resourceType = resourceTypeCollection.find(resourceType => resourceType.slug === iteration.resourceType);
            const file = {
              format: test.format,
              resources_ids: [uuidv4()],
              folders_ids: [foldersDto[0].id],
              option: {credentials: {
                keyfile: fs.readFileSync("./src/all/background_page/model/import/resources/kdbx/kdbx-keyfile.key", {encoding: 'base64'})
              }}
            };
            const resourceCollectionV4 = await resourceCollectionV4ToExport({
              resourceType: resourceType,
              folder_parent_id: foldersDto[0].id,
              totp: defaultTotpDto({secret_key: "THISISASECRET"})
            });

            const exportResourcesFileEntity = new ExportResourcesFileEntity(file);
            jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourceCollectionV4);
            await getKDBXContent(exportResourcesFileEntity, new ResourcesCollection(resourceCollectionV4));
            await service.prepareExportContent(exportResourcesFileEntity);
            await service.exportToFile(exportResourcesFileEntity, pgpKeys.ada.passphrase);

            const expectedResourcesFileEntity = new ExportResourcesFileEntity(file);
            await getKDBXContent(expectedResourcesFileEntity, new ResourcesCollection(resourceCollectionV4));

            expect(exportResourcesFileEntity.file).toEqual(expectedResourcesFileEntity.file);
          });
        });
      });
    });

    it("Should inform the user about the progress", async() => {
      expect.assertions(4);

      jest.spyOn(service.progressService, "updateGoals");
      jest.spyOn(service.progressService, "finishStep");
      const resourceType = resourceTypeCollection.find(resourceType => resourceType.slug === RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG);

      const file = {
        format: FORMAT_CSV_KDBX,
        resources_ids: [uuidv4()],
        folders_ids: [foldersDto[0].id],
      };
      const exportResourcesFileEntity = new ExportResourcesFileEntity(file);

      const resourceCollectionV4 = await resourceCollectionV5ToExport({
        resourceType: resourceType,
        folder_parent_id: foldersDto[0].id
      });

      jest.spyOn(ResourceService.prototype, "findAll").mockImplementation(() => resourceCollectionV4);

      await service.prepareExportContent(exportResourcesFileEntity);
      await service.exportToFile(exportResourcesFileEntity, pgpKeys.ada.passphrase);

      expect(service.progressService.updateGoals).toHaveBeenCalledTimes(1);
      expect(service.progressService.updateGoals).toHaveBeenCalledWith(3);
      expect(service.progressService.finishStep).toHaveBeenCalledTimes(2);
      expect(service.progressService.finishStep).toHaveBeenCalledWith("Decrypting 1/1");
    });
  });

  describe("::buildCustomFieldWithSecretDto", () => {
    it("Should build custom fields with secret", () => {
      expect.assertions(4);

      const customFieldsCollection = defaultCustomFieldsCollection();

      const plaintextSecret = {
        customFields: [
          {id: customFieldsCollection[0].id, secret_value: "Secret Value 1"},
          {id: customFieldsCollection[1].id, secret_value: "Secret Value 2"}
        ]
      };

      const exportResourceEntity = {
        customFields: new CustomFieldsCollection(customFieldsCollection)
      };

      const result = service.buildCustomFieldWithSecretDto(exportResourceEntity, plaintextSecret);

      expect(result).toBeInstanceOf(CustomFieldsCollection);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].value).toEqual("Secret Value 1");
      expect(result.items[1].value).toEqual("Secret Value 2");
    });

    it("Should handle missing custom fields", () => {
      expect.assertions(2);

      const exportResourceEntity = {
        customFields: {
          items: []
        }
      };

      const plaintextSecret = {
        customFields: []
      };

      const result = service.buildCustomFieldWithSecretDto(exportResourceEntity, plaintextSecret);

      expect(result).toBeInstanceOf(CustomFieldsCollection);
      expect(result.items).toHaveLength(0);
    });
  });
});
